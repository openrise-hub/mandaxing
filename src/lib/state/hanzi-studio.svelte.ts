import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import { fetchAudioBuffer } from "#lib/audio/cdn-resolver";
import { playSequence } from "#lib/audio/reference-audio";
import bank02 from "#lib/data/bank-02-questions.json";
import bank03 from "#lib/data/bank-03-verbs.json";
import { db } from "#lib/db/database";
import { ensureCard } from "#lib/srs/queue";
import type { ComponentBreakdown, WordBankEntry } from "#lib/types/catalogs";
import {
	fetchHanziData,
	HanziDataUnavailableError,
	type HanziStrokeData,
} from "#lib/vector/hanzi-loader";
import {
	type StrokeEvaluation,
	type VectorPoint,
	validateStrokePath,
} from "#lib/vector/stroke-evaluator";

export interface StudioCharacter {
	character: string;
	syllable: string;
	tone: number;
	source: WordBankEntry;
	breakdown: ComponentBreakdown;
}

export type StudioStatus = "idle" | "loading" | "unavailable" | "offline";

export type StrokeFeedback = "idle" | "accepted" | "rejected";

function buildCharacters(): StudioCharacter[] {
	const words: WordBankEntry[] = [
		...(bank02 as WordBankEntry[]),
		...(bank03 as WordBankEntry[]),
	];
	const characters: StudioCharacter[] = [];
	for (const source of words) {
		source.breakdown.forEach((breakdown, index) => {
			const syllable = source.syllables[index];
			const tone = source.tones[index];
			if (syllable === undefined || tone === undefined) return;
			characters.push({
				character: breakdown.character,
				syllable,
				tone,
				source,
				breakdown,
			});
		});
	}
	return characters;
}

export const STUDIO_CHARACTERS = buildCharacters();

const STUDIO_WORDS: WordBankEntry[] = [
	...(bank02 as WordBankEntry[]),
	...(bank03 as WordBankEntry[]),
];

class HanziStudio {
	index = $state(0);
	status = $state<StudioStatus>("idle");
	strokeData = $state<HanziStrokeData | null>(null);
	completedStrokes = $state(0);
	feedback = $state<StrokeFeedback>("idle");
	rejectionReason = $state<"start" | "end" | "deviation" | null>(null);
	mastered = $state(false);
	playing = $state(false);
	audioUnavailable = $state(false);

	get characters(): StudioCharacter[] {
		return STUDIO_CHARACTERS;
	}

	get current(): StudioCharacter | undefined {
		return STUDIO_CHARACTERS[this.index];
	}

	get totalStrokes(): number {
		return this.strokeData?.strokes.length ?? 0;
	}

	get compoundWords(): WordBankEntry[] {
		const current = this.current;
		if (!current) return [];
		return STUDIO_WORDS.filter(
			(item) =>
				item.id !== current.source.id &&
				item.characters.includes(current.character),
		);
	}

	private resetAttempt(): void {
		this.strokeData = null;
		this.completedStrokes = 0;
		this.feedback = "idle";
		this.rejectionReason = null;
		this.mastered = false;
		this.audioUnavailable = false;
	}

	async load(): Promise<void> {
		const current = this.current;
		this.resetAttempt();
		if (!current) return;
		this.status = "loading";
		try {
			const data = await fetchHanziData(current.character);
			const mastery = await db.characterMastery
				.where("character")
				.equals(current.character)
				.first();
			this.strokeData = data;
			this.mastered = mastery?.completedCleanly ?? false;
			this.status = "idle";
		} catch (error) {
			this.status =
				error instanceof HanziDataUnavailableError ? "unavailable" : "offline";
		}
	}

	async select(delta: number): Promise<void> {
		const total = STUDIO_CHARACTERS.length;
		if (total === 0) return;
		this.index = (this.index + delta + total) % total;
		await this.load();
	}

	clear(): void {
		this.completedStrokes = 0;
		this.feedback = "idle";
		this.rejectionReason = null;
	}

	async playAudio(): Promise<void> {
		const current = this.current;
		if (!current || this.playing) return;
		this.audioUnavailable = false;
		this.playing = true;
		try {
			await resumeAudioContext();
			const context = getAudioContext();
			const buffer = await fetchAudioBuffer(
				context,
				current.syllable,
				current.tone,
			);
			await playSequence(context, [buffer]);
		} catch {
			this.audioUnavailable = true;
		} finally {
			this.playing = false;
		}
	}

	submitStroke(points: VectorPoint[]): StrokeEvaluation | null {
		const data = this.strokeData;
		const median = data?.medians[this.completedStrokes];
		if (!data || !median) return null;
		const evaluation = validateStrokePath(points, median);
		if (evaluation.valid) {
			this.feedback = "accepted";
			this.rejectionReason = null;
			this.completedStrokes += 1;
			if (this.completedStrokes >= data.strokes.length) {
				void this.completeCharacter();
			}
		} else {
			this.feedback = "rejected";
			this.rejectionReason =
				evaluation.reason === "valid" ? "deviation" : evaluation.reason;
		}
		return evaluation;
	}

	private async completeCharacter(): Promise<void> {
		const current = this.current;
		if (!current) return;
		try {
			const timestamp = new Date();
			const existing = await db.characterMastery
				.where("character")
				.equals(current.character)
				.first();
			if (existing?.id !== undefined) {
				await db.characterMastery.put({
					...existing,
					completedCleanly: true,
					lastPracticed: timestamp,
				});
			} else {
				await db.characterMastery.add({
					character: current.character,
					completedCleanly: true,
					lastPracticed: timestamp,
				});
			}
			await ensureCard("character", current.character);
			this.mastered = true;
		} catch {
			this.mastered = false;
		}
	}
}

export const studio = new HanziStudio();
