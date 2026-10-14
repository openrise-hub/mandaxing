import type { Grade } from "ts-fsrs";
import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import { fetchAudioBuffer } from "#lib/audio/cdn-resolver";
import { playSequence } from "#lib/audio/reference-audio";
import bank01 from "#lib/data/bank-01-pronouns.json";
import bank02 from "#lib/data/bank-02-questions.json";
import bank03 from "#lib/data/bank-03-verbs.json";
import type { SRSCardRecord } from "#lib/db/database";
import { getDueCards, initializeWordCards, submitReview } from "#lib/srs/queue";
import { previewRatings, type RatingPreview } from "#lib/srs/scheduler";
import { STUDIO_CHARACTERS } from "#lib/state/hanzi-studio.svelte";
import type {
	ComponentBreakdown,
	WordBankEntry,
	WordBankItem,
} from "#lib/types/catalogs";

export interface ReviewCardView {
	card: SRSCardRecord;
	characters: string;
	pinyin: string | null;
	en: string | null;
	es: string | null;
	breakdown: ComponentBreakdown | null;
	syllables: string[];
	tones: number[];
}

export type ReviewStatus = "idle" | "loading" | "offline";

const WORDS: Array<WordBankItem | WordBankEntry> = [
	...(bank01 as WordBankItem[]),
	...(bank02 as WordBankEntry[]),
	...(bank03 as WordBankEntry[]),
];

const WORD_INDEX = new Map(WORDS.map((item) => [item.id, item]));

const CHARACTER_AUDIO = new Map(
	STUDIO_CHARACTERS.map((entry) => [
		entry.character,
		{ syllable: entry.syllable, tone: entry.tone },
	]),
);

function firstBreakdown(
	item: WordBankItem | WordBankEntry,
): ComponentBreakdown | null {
	if (!("breakdown" in item)) return null;
	return item.breakdown[0] ?? null;
}

function toView(card: SRSCardRecord): ReviewCardView | null {
	if (card.itemType === "word") {
		const item = WORD_INDEX.get(card.itemId);
		if (!item) return null;
		return {
			card,
			characters: item.characters,
			pinyin: item.pinyin,
			en: item.en,
			es: item.es,
			breakdown: firstBreakdown(item),
			syllables: item.syllables,
			tones: item.tones,
		};
	}
	const audio = CHARACTER_AUDIO.get(card.itemId);
	return {
		card,
		characters: card.itemId,
		pinyin: null,
		en: null,
		es: null,
		breakdown: null,
		syllables: audio ? [audio.syllable] : [],
		tones: audio ? [audio.tone] : [],
	};
}

class DailyReview {
	status = $state<ReviewStatus>("idle");
	queue = $state<ReviewCardView[]>([]);
	revealed = $state(false);
	submitting = $state(false);
	playing = $state(false);
	audioUnavailable = $state(false);

	get current(): ReviewCardView | undefined {
		return this.queue[0];
	}

	get dueCount(): number {
		return this.queue.length;
	}

	get previews(): RatingPreview[] {
		const current = this.current;
		return current ? previewRatings(current.card) : [];
	}

	private async refresh(): Promise<void> {
		const due = await getDueCards();
		this.queue = due.flatMap((card) => {
			const view = toView(card);
			return view ? [view] : [];
		});
	}

	async init(): Promise<void> {
		this.status = "loading";
		try {
			await initializeWordCards();
			await this.refresh();
			this.status = "idle";
		} catch {
			this.status = "offline";
		}
	}

	reveal(): void {
		if (this.current) {
			this.revealed = true;
		}
	}

	async grade(rating: Grade): Promise<void> {
		const current = this.current;
		if (!current || this.submitting || !this.revealed) return;
		this.submitting = true;
		try {
			await submitReview(current.card, rating);
			this.queue = this.queue.slice(1);
			this.revealed = false;
			this.audioUnavailable = false;
		} catch {
			this.status = "offline";
		} finally {
			this.submitting = false;
		}
	}

	async playAudio(): Promise<void> {
		const current = this.current;
		if (!current || this.playing || current.syllables.length === 0) return;
		this.audioUnavailable = false;
		this.playing = true;
		try {
			await resumeAudioContext();
			const context = getAudioContext();
			const buffers = await Promise.all(
				current.syllables.map((syllable, index) =>
					fetchAudioBuffer(context, syllable, current.tones[index] ?? 0),
				),
			);
			await playSequence(context, buffers);
		} catch {
			this.audioUnavailable = true;
		} finally {
			this.playing = false;
		}
	}
}

export const review = new DailyReview();
