import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import {
	AudioUnavailableError,
	fetchAudioBuffer,
} from "#lib/audio/cdn-resolver";
import { MicPitchTracker } from "#lib/audio/pitch-tracker";
import {
	extractReferenceContour,
	playSequence,
} from "#lib/audio/reference-audio";
import type { ContourPoint } from "#lib/audio/yin";
import bank01 from "#lib/data/bank-01-pronouns.json";
import isolatedTones from "#lib/data/isolated-tones.json";
import minimalPairs from "#lib/data/minimal-pairs.json";
import tonePairs from "#lib/data/tone-pairs.json";
import { db } from "#lib/db/database";
import { evaluateContour, type ScoreResult } from "#lib/dsp/scoring";
import type {
	IsolatedToneItem,
	MinimalPairItem,
	TonePairItem,
	WordBankItem,
} from "#lib/types/catalogs";

export type LabMode = "single" | "pairs" | "minimal";
export type LabStatus =
	| "idle"
	| "loading"
	| "playing"
	| "recording"
	| "evaluating"
	| "unavailable"
	| "offline";
export type BlindFeedback = "idle" | "correct" | "incorrect";

export interface Stimulus {
	id: string;
	pinyin: string;
	hanzi: string;
	en: string;
	es: string;
	tones: number[];
	label?: string;
	syllables: Array<{ syllable: string; tone: number }>;
}

function buildSingleStimuli(): Stimulus[] {
	return (isolatedTones as IsolatedToneItem[]).flatMap((item) =>
		item.tones.map((variant) => ({
			id: `${item.id}-${variant.tone}`,
			pinyin: variant.pinyin,
			hanzi: "",
			en: "",
			es: "",
			tones: [variant.tone],
			syllables: [{ syllable: item.syllable, tone: variant.tone }],
		})),
	);
}

function buildPairStimuli(): Stimulus[] {
	return (tonePairs as TonePairItem[]).map((pair) => ({
		id: `pair-${pair.pair}`,
		pinyin: pair.pinyin,
		hanzi: pair.hanzi,
		en: pair.en,
		es: pair.es,
		tones: pair.tones,
		label: pair.pair,
		syllables: pair.syllables.map((syllable, index) => ({
			syllable,
			tone: pair.tones[index] ?? 0,
		})),
	}));
}

function buildMinimalStimuli(): Stimulus[] {
	return (minimalPairs as MinimalPairItem[]).map((item) => ({
		id: item.id,
		pinyin: `${item.itemA.pinyin} / ${item.itemB.pinyin}`,
		hanzi: "",
		en: `${item.itemA.en} / ${item.itemB.en}`,
		es: `${item.itemA.es} / ${item.itemB.es}`,
		tones: [item.itemA.tone],
		label: item.contrast,
		syllables: [{ syllable: item.itemA.syllable, tone: item.itemA.tone }],
	}));
}

function buildWordStimulus(item: WordBankItem): Stimulus {
	return {
		id: item.id,
		pinyin: item.pinyin,
		hanzi: item.characters,
		en: item.en,
		es: item.es,
		tones: item.tones,
		syllables: item.syllables.map((syllable, index) => ({
			syllable,
			tone: item.tones[index] ?? 0,
		})),
	};
}

class ToneLab {
	mode = $state<LabMode>("single");
	status = $state<LabStatus>("idle");
	index = $state(0);
	override = $state<Stimulus | null>(null);
	reference = $state<ContourPoint[]>([]);
	user = $state<ContourPoint[]>([]);
	result = $state<ScoreResult | null>(null);
	minimalTarget = $state<"A" | "B">("A");
	minimalAnswered = $state<"A" | "B" | null>(null);
	blindTarget = $state<Stimulus | null>(null);
	blindFeedback = $state<BlindFeedback>("idle");
	unavailableIds = $state<string[]>([]);
	readonly wordItems = bank01 as WordBankItem[];

	private singleList = buildSingleStimuli();
	private pairList = buildPairStimuli();
	private minimalList = buildMinimalStimuli();
	private referenceBuffers: AudioBuffer[] | null = null;
	private tracker: MicPitchTracker | null = null;
	private promptStartedAt = 0;

	get list(): Stimulus[] {
		if (this.mode === "single") return this.singleList;
		if (this.mode === "pairs") return this.pairList;
		return this.minimalList;
	}

	get stimuli(): Stimulus[] {
		return this.list;
	}

	get currentStimulus(): Stimulus | undefined {
		return this.override ?? this.list[this.index];
	}

	get currentUnavailable(): boolean {
		const stimulus = this.currentStimulus;
		return (
			this.status === "unavailable" ||
			(!!stimulus && this.unavailableIds.includes(stimulus.id))
		);
	}

	setMode(mode: LabMode): void {
		if (this.mode === mode) return;
		this.mode = mode;
		this.index = 0;
		this.override = null;
		this.resetAttempt();
	}

	setIndex(delta: number): void {
		const list = this.list;
		if (list.length === 0) return;
		this.index = (this.index + delta + list.length) % list.length;
		this.override = null;
		this.resetAttempt();
	}

	selectWord(item: WordBankItem): void {
		this.override = buildWordStimulus(item);
		this.resetAttempt();
	}

	private resetAttempt(): void {
		this.status = "idle";
		this.reference = [];
		this.user = [];
		this.result = null;
		this.referenceBuffers = null;
		this.minimalAnswered = null;
	}

	private recordUnavailable(id: string): void {
		if (!this.unavailableIds.includes(id)) {
			this.unavailableIds = [...this.unavailableIds, id];
		}
	}

	private handleAudioFailure(error: unknown, stimulusId: string): void {
		if (error instanceof AudioUnavailableError) {
			this.recordUnavailable(stimulusId);
			this.status = "unavailable";
		} else {
			this.status = "offline";
		}
	}

	private async ensureReference(stimulus: Stimulus): Promise<boolean> {
		if (this.referenceBuffers) return true;
		if (this.unavailableIds.includes(stimulus.id)) {
			this.status = "unavailable";
			return false;
		}
		this.status = "loading";
		try {
			const context = getAudioContext();
			this.referenceBuffers = await Promise.all(
				stimulus.syllables.map(({ syllable, tone }) =>
					fetchAudioBuffer(context, syllable, tone),
				),
			);
			this.reference = extractReferenceContour(this.referenceBuffers);
			this.status = "idle";
			return true;
		} catch (error) {
			this.handleAudioFailure(error, stimulus.id);
			return false;
		}
	}

	async play(): Promise<void> {
		const stimulus = this.currentStimulus;
		if (!stimulus || this.status === "playing" || this.status === "recording")
			return;
		if (!(await this.ensureReference(stimulus))) return;
		if (!this.referenceBuffers) return;
		await resumeAudioContext();
		this.status = "playing";
		await playSequence(getAudioContext(), this.referenceBuffers);
		if (this.status === "playing") {
			this.status = "idle";
		}
	}

	async startRecording(): Promise<void> {
		const stimulus = this.currentStimulus;
		if (!stimulus || this.status === "recording") return;
		if (!(await this.ensureReference(stimulus))) return;
		await resumeAudioContext();
		this.user = [];
		this.result = null;
		const startedAt = performance.now();
		this.tracker ??= new MicPitchTracker();
		try {
			await this.tracker.start((frame) => {
				if (frame.frequency > 0) {
					this.user = [
						...this.user,
						{ timeMs: frame.timestamp - startedAt, frequency: frame.frequency },
					];
				}
			});
			this.status = "recording";
		} catch {
			this.status = "offline";
		}
	}

	async stopRecording(): Promise<void> {
		if (this.status !== "recording") return;
		this.tracker?.stop();
		this.status = "evaluating";
		this.result = evaluateContour(this.user, this.reference);
		this.status = "idle";
		await this.persistCalibration();
	}

	async playMinimalPrompt(): Promise<void> {
		const item = (minimalPairs as MinimalPairItem[])[this.index];
		if (!item) return;
		this.minimalTarget = Math.random() < 0.5 ? "A" : "B";
		this.minimalAnswered = null;
		const chosen = this.minimalTarget === "A" ? item.itemA : item.itemB;
		this.status = "loading";
		try {
			const context = getAudioContext();
			const buffers = [
				await fetchAudioBuffer(context, chosen.syllable, chosen.tone),
			];
			await resumeAudioContext();
			this.status = "playing";
			this.promptStartedAt = performance.now();
			await playSequence(context, buffers);
			this.status = "idle";
		} catch (error) {
			this.handleAudioFailure(error, item.id);
		}
	}

	async answerMinimal(choice: "A" | "B"): Promise<void> {
		if (this.minimalAnswered) return;
		this.minimalAnswered = choice;
		const item = (minimalPairs as MinimalPairItem[])[this.index];
		if (!item) return;
		const played = this.minimalTarget === "A" ? item.itemA : item.itemB;
		const selected = choice === "A" ? item.itemA : item.itemB;
		await this.persistDiscrimination(
			"MINIMAL",
			played.pinyin,
			selected.pinyin,
			choice === this.minimalTarget,
		);
	}

	get minimalResult(): boolean | null {
		if (!this.minimalAnswered) return null;
		return this.minimalAnswered === this.minimalTarget;
	}

	async playBlindPrompt(): Promise<void> {
		const candidates = this.singleList.filter(
			(stimulus) => (stimulus.tones[0] ?? 0) !== 0,
		);
		const target = candidates[Math.floor(Math.random() * candidates.length)];
		if (!target) return;
		this.blindTarget = target;
		this.blindFeedback = "idle";
		this.status = "loading";
		try {
			const context = getAudioContext();
			const buffers = await Promise.all(
				target.syllables.map(({ syllable, tone }) =>
					fetchAudioBuffer(context, syllable, tone),
				),
			);
			await resumeAudioContext();
			this.status = "playing";
			this.promptStartedAt = performance.now();
			await playSequence(context, buffers);
			this.status = "idle";
		} catch (error) {
			this.handleAudioFailure(error, target.id);
		}
	}

	async answerBlindTone(tone: number): Promise<void> {
		const target = this.blindTarget;
		if (!target || this.blindFeedback !== "idle") return;
		this.blindFeedback =
			(target.tones[0] ?? 0) === tone ? "correct" : "incorrect";
		await this.persistDiscrimination(
			"SINGLE",
			target.pinyin,
			String(tone),
			this.blindFeedback === "correct",
		);
	}

	private async persistCalibration(): Promise<void> {
		const stimulus = this.currentStimulus;
		if (!stimulus || !this.result) return;
		try {
			await db.calibrations.add({
				timestamp: new Date(),
				syllable: stimulus.syllables.map(({ syllable }) => syllable).join("-"),
				expectedTone: stimulus.tones[0] ?? 0,
				accuracyScore: this.result.score,
				passed: this.result.passed,
			});
		} catch {
			// persistence is best-effort; the score stays visible for the session
		}
	}

	private async persistDiscrimination(
		testType: "SINGLE" | "PAIR" | "MINIMAL",
		targetPrompt: string,
		userSelection: string,
		correct: boolean,
	): Promise<void> {
		try {
			await db.discriminationTests.add({
				timestamp: new Date(),
				testType,
				targetPrompt,
				userSelection,
				correct,
				responseTimeMs: Math.round(performance.now() - this.promptStartedAt),
			});
		} catch {
			// persistence is best-effort
		}
	}
}

export const lab = new ToneLab();
