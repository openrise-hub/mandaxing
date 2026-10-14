import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import { fetchAudioBuffer } from "#lib/audio/cdn-resolver";
import { playSequence } from "#lib/audio/reference-audio";
import bank01 from "#lib/data/bank-01-pronouns.json";
import bank02 from "#lib/data/bank-02-questions.json";
import bank03 from "#lib/data/bank-03-verbs.json";
import bank04 from "#lib/data/bank-04-logical.json";
import bank05 from "#lib/data/bank-05-space-time.json";
import bank06 from "#lib/data/bank-06-numbers-classifiers.json";
import bank07 from "#lib/data/bank-07-survival-nouns.json";
import bank08 from "#lib/data/bank-08-polar-adjectives.json";
import { db } from "#lib/db/database";
import type { WordBankEntry, WordBankItem } from "#lib/types/catalogs";

export type WordCategory =
	| "pronouns"
	| "questions"
	| "verbs"
	| "logical"
	| "spacetime"
	| "numbers"
	| "nouns"
	| "adjectives";

export interface CategoryMeta {
	key: WordCategory;
	labelEn: string;
	labelEs: string;
	items: Array<WordBankItem | WordBankEntry>;
}

export const CATEGORIES: CategoryMeta[] = [
	{
		key: "pronouns",
		labelEn: "Pronouns",
		labelEs: "Pronombres",
		items: bank01 as WordBankItem[],
	},
	{
		key: "questions",
		labelEn: "Questions",
		labelEs: "Preguntas",
		items: bank02 as WordBankEntry[],
	},
	{
		key: "verbs",
		labelEn: "Core Verbs",
		labelEs: "Verbos Clave",
		items: bank03 as WordBankEntry[],
	},
	{
		key: "logical",
		labelEn: "Connectors",
		labelEs: "Conectores",
		items: bank04 as WordBankEntry[],
	},
	{
		key: "spacetime",
		labelEn: "Space & Time",
		labelEs: "Espacio y Tiempo",
		items: bank05 as WordBankEntry[],
	},
	{
		key: "numbers",
		labelEn: "Numbers",
		labelEs: "Números",
		items: bank06 as WordBankEntry[],
	},
	{
		key: "nouns",
		labelEn: "Survival Nouns",
		labelEs: "Sustantivos",
		items: bank07 as WordBankEntry[],
	},
	{
		key: "adjectives",
		labelEn: "Adjectives",
		labelEs: "Adjetivos",
		items: bank08 as WordBankEntry[],
	},
];

class WordMatrixState {
	selectedCategory = $state<WordCategory>("pronouns");
	searchQuery = $state("");
	playingId = $state<string | null>(null);
	stabilityMap = $state<Record<string, number>>({});

	get activeCategory(): CategoryMeta {
		const found = CATEGORIES.find((c) => c.key === this.selectedCategory);
		return found ?? (CATEGORIES[0] as CategoryMeta);
	}

	get filteredWords(): Array<WordBankItem | WordBankEntry> {
		const query = this.searchQuery.trim().toLowerCase();
		const items = this.activeCategory.items;
		if (!query) return items;
		return items.filter(
			(item) =>
				item.characters.includes(query) ||
				item.pinyin.toLowerCase().includes(query) ||
				item.en.toLowerCase().includes(query) ||
				item.es.toLowerCase().includes(query),
		);
	}

	async loadStability(): Promise<void> {
		try {
			const cards = await db.cards.toArray();
			const map: Record<string, number> = {};
			for (const c of cards) {
				map[c.itemId] = Math.round(c.stability * 10) / 10;
			}
			this.stabilityMap = map;
		} catch {
			this.stabilityMap = {};
		}
	}

	async playAudio(item: WordBankItem | WordBankEntry): Promise<void> {
		if (this.playingId || item.syllables.length === 0) return;
		this.playingId = item.id;
		try {
			await resumeAudioContext();
			const context = getAudioContext();
			const buffers = await Promise.all(
				item.syllables.map((syllable, idx) =>
					fetchAudioBuffer(context, syllable, item.tones[idx] ?? 0),
				),
			);
			await playSequence(context, buffers);
		} catch {
			// graceful audio failure
		} finally {
			this.playingId = null;
		}
	}
}

export const wordMatrix = new WordMatrixState();
