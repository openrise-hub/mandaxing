import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import { fetchAudioBuffer } from "#lib/audio/cdn-resolver";
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
	readonly wordItems = bank01 as WordBankItem[];

	private singleList = buildSingleStimuli();
	private pairList = buildPairStimuli();
	private minimalList = buildMinimalStimuli();
	private referenceBuffers: AudioBuffer[] | null = null;
	private tracker: MicPitchTracker | null = null;

	get list(): Stimulus[] {
		if (this.mode === "single") return this.singleList;
		if (this.mode === "pairs") return this.pairList;
		return this.minimalList;
	}

	get currentStimulus(): Stimulus | undefined {
		return this.override ?? this.list[this.index];
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

	private async ensureReference(stimulus: Stimulus): Promise<boolean> {
		if (this.referenceBuffers) return true;
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
		} catch {
			this.status = "offline";
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
			await playSequence(context, buffers);
			this.status = "idle";
		} catch {
			this.status = "offline";
		}
	}

	answerMinimal(choice: "A" | "B"): void {
		if (this.minimalAnswered) return;
		this.minimalAnswered = choice;
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
			await playSequence(context, buffers);
			this.status = "idle";
		} catch {
			this.status = "offline";
		}
	}

	answerBlindTone(tone: number): void {
		const target = this.blindTarget;
		if (!target || this.blindFeedback !== "idle") return;
		this.blindFeedback =
			(target.tones[0] ?? 0) === tone ? "correct" : "incorrect";
	}
}

export const lab = new ToneLab();
