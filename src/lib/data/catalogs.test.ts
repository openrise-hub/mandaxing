import { describe, expect, it } from "vitest";
import type {
	IsolatedToneItem,
	MinimalPairItem,
	TonePairItem,
	WordBankEntry,
	WordBankItem,
} from "#lib/types/catalogs";
import bank01 from "./bank-01-pronouns.json";
import bank02 from "./bank-02-questions.json";
import bank03 from "./bank-03-verbs.json";
import isolatedTones from "./isolated-tones.json";
import minimalPairs from "./minimal-pairs.json";
import tonePairs from "./tone-pairs.json";

const SYLLABLE_PATTERN = /^[a-z]+$/;
const KNOWN_UNRESOLVABLE_SYLLABLES = ["lv"];

const isolated = isolatedTones as IsolatedToneItem[];
const pairs = tonePairs as TonePairItem[];
const minimal = minimalPairs as MinimalPairItem[];
const bank = bank01 as WordBankItem[];
const questions = bank02 as WordBankEntry[];
const verbs = bank03 as WordBankEntry[];

function expectUniqueIds(items: Array<{ id: string }>): void {
	const ids = items.map((item) => item.id);
	expect(new Set(ids).size, "ids must be unique").toBe(ids.length);
}

function expectValidTone(tone: number, context: string): void {
	expect(Number.isInteger(tone), `${context}: tone must be an integer`).toBe(
		true,
	);
	expect(tone, `${context}: tone must be at least 0`).toBeGreaterThanOrEqual(0);
	expect(tone, `${context}: tone must be at most 4`).toBeLessThanOrEqual(4);
}

function expectAudioReadyEntries(items: WordBankItem[]): void {
	expectUniqueIds(items);
	for (const item of items) {
		expect(
			item.syllables.length,
			`${item.id}: syllable/tone length mismatch`,
		).toBe(item.tones.length);
		for (const syllable of item.syllables) {
			expect(syllable, `${item.id}: syllable must be ASCII pinyin`).toMatch(
				SYLLABLE_PATTERN,
			);
		}
		for (const tone of item.tones) {
			expectValidTone(tone, item.id);
		}
		expect(
			item.characters.trim(),
			`${item.id}: characters must not be empty`,
		).not.toBe("");
		expect(item.en.trim(), `${item.id}: en must not be empty`).not.toBe("");
		expect(item.es.trim(), `${item.id}: es must not be empty`).not.toBe("");
	}
}

function expectPhonosemanticBreakdown(items: WordBankEntry[]): void {
	for (const item of items) {
		const characters = Array.from(item.characters);
		expect(
			item.breakdown.length,
			`${item.id}: breakdown must cover every character`,
		).toBe(characters.length);
		for (const [index, entry] of item.breakdown.entries()) {
			expect(
				entry.character,
				`${item.id}: breakdown character mismatch at ${index}`,
			).toBe(characters[index]);
			expect(
				entry.radical.trim(),
				`${item.id}/${entry.character}: radical must not be empty`,
			).not.toBe("");
			expect(
				entry.radicalMeaning.en.trim(),
				`${item.id}/${entry.character}: radicalMeaning.en must not be empty`,
			).not.toBe("");
			expect(
				entry.radicalMeaning.es.trim(),
				`${item.id}/${entry.character}: radicalMeaning.es must not be empty`,
			).not.toBe("");
			if (entry.phonetic === null) {
				expect(
					entry.phoneticHint,
					`${item.id}/${entry.character}: hint must be null without a phonetic`,
				).toBeNull();
			} else {
				expect(
					entry.phonetic.trim(),
					`${item.id}/${entry.character}: phonetic must not be empty`,
				).not.toBe("");
				expect(
					entry.phoneticHint === null ? "" : entry.phoneticHint.trim(),
					`${item.id}/${entry.character}: phonetic needs a reading hint`,
				).not.toBe("");
			}
		}
	}
}

describe("isolated tones catalog", () => {
	it("has unique ids and complete tone variants", () => {
		expectUniqueIds(isolated);
		for (const item of isolated) {
			expect(
				item.syllable,
				`${item.id}: syllable must be ASCII pinyin`,
			).toMatch(SYLLABLE_PATTERN);
			expect(
				item.tones.length,
				`${item.id}: needs at least four tone variants`,
			).toBeGreaterThanOrEqual(4);
			for (const variant of item.tones) {
				expectValidTone(variant.tone, item.id);
				expect(
					variant.pinyin.trim(),
					`${item.id}: pinyin must not be empty`,
				).not.toBe("");
			}
		}
	});
});

describe("tone pairs catalog", () => {
	it("covers the full 20-pair matrix", () => {
		expect(pairs).toHaveLength(20);
		expect(
			new Set(pairs.map((item) => item.pair)).size,
			"pair labels must be unique",
		).toBe(20);
	});

	it("keeps syllables, tones and labels consistent", () => {
		for (const item of pairs) {
			expect(
				item.syllables.length,
				`${item.pair}: syllable/tone length mismatch`,
			).toBe(item.tones.length);
			for (const syllable of item.syllables) {
				expect(syllable, `${item.pair}: syllable must be ASCII pinyin`).toMatch(
					SYLLABLE_PATTERN,
				);
			}
			for (const tone of item.tones) {
				expectValidTone(tone, item.pair);
			}
			const [first, second] = item.tones;
			const labelIsLexical = `${first}+${second}` === item.pair;
			const isSandhiPair = item.pair === "3+3" && first === 2 && second === 3;
			expect(
				labelIsLexical || isSandhiPair,
				`${item.pair}: tones must match the label (3+3 stores its surface sandhi tones)`,
			).toBe(true);
			expect(
				item.hanzi.trim(),
				`${item.pair}: hanzi must not be empty`,
			).not.toBe("");
			expect(item.en.trim(), `${item.pair}: en must not be empty`).not.toBe("");
			expect(item.es.trim(), `${item.pair}: es must not be empty`).not.toBe("");
		}
	});
});

describe("minimal pairs catalog", () => {
	it("has unique ids and valid A/B variants", () => {
		expectUniqueIds(minimal);
		for (const item of minimal) {
			for (const variant of [item.itemA, item.itemB]) {
				expect(
					variant.syllable,
					`${item.id}: syllable must be ASCII pinyin`,
				).toMatch(SYLLABLE_PATTERN);
				expectValidTone(variant.tone, item.id);
				expect(
					variant.pinyin.trim(),
					`${item.id}: pinyin must not be empty`,
				).not.toBe("");
				expect(
					variant.hanzi.trim(),
					`${item.id}: hanzi must not be empty`,
				).not.toBe("");
				expect(variant.en.trim(), `${item.id}: en must not be empty`).not.toBe(
					"",
				);
				expect(variant.es.trim(), `${item.id}: es must not be empty`).not.toBe(
					"",
				);
			}
		}
	});
});

describe("word bank 1", () => {
	it("has unique ids and audio-ready entries", () => {
		expectAudioReadyEntries(bank);
	});

	it("keeps the known unresolvable syllables explicit", () => {
		const used = new Set(
			[...pairs, ...bank, ...questions, ...verbs].flatMap(
				(item) => item.syllables,
			),
		);
		for (const syllable of KNOWN_UNRESOLVABLE_SYLLABLES) {
			expect(
				used.has(syllable),
				`${syllable} is expected in the travel 3+2 entry`,
			).toBe(true);
		}
	});
});

describe("word bank 2", () => {
	it("has unique ids and audio-ready question words", () => {
		expectAudioReadyEntries(questions);
	});

	it("documents radical and phonetic components for every character", () => {
		expectPhonosemanticBreakdown(questions);
	});
});

describe("word bank 3", () => {
	it("has unique ids and audio-ready core verbs", () => {
		expectAudioReadyEntries(verbs);
	});

	it("documents radical and phonetic components for every character", () => {
		expectPhonosemanticBreakdown(verbs);
	});
});
