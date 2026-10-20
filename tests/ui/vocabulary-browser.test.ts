import { beforeEach, describe, expect, it } from "vitest";
import VocabularyBrowser from "#lib/components/VocabularyBrowser.svelte";
import { CATEGORIES, wordMatrix } from "#lib/state/word-matrix.svelte";

describe("Vocabulary Browser and Word Matrix", () => {
	beforeEach(() => {
		wordMatrix.selectedCategory = "pronouns";
		wordMatrix.searchQuery = "";
	});

	it("exports VocabularyBrowser component", () => {
		expect(VocabularyBrowser).toBeDefined();
	});

	it("has 8 populated grammatical categories", () => {
		expect(CATEGORIES).toHaveLength(8);
		for (const cat of CATEGORIES) {
			expect(cat.items.length).toBeGreaterThan(0);
		}
	});

	it("filters words according to search query", () => {
		wordMatrix.selectedCategory = "pronouns";
		const initialCount = wordMatrix.filteredWords.length;
		expect(initialCount).toBeGreaterThan(0);

		wordMatrix.searchQuery = "我";
		expect(wordMatrix.filteredWords).toHaveLength(2);
		expect(wordMatrix.filteredWords[0]?.characters).toBe("我");

		wordMatrix.searchQuery = "nonexistent_query_xyz";
		expect(wordMatrix.filteredWords).toHaveLength(0);
	});

	it("switches category and updates active category meta", () => {
		wordMatrix.selectedCategory = "numbers";
		expect(wordMatrix.activeCategory.key).toBe("numbers");
		expect(wordMatrix.filteredWords.length).toBeGreaterThanOrEqual(10);
	});

	it("provides complete properties for study modes across all categories", () => {
		for (const cat of CATEGORIES) {
			for (const item of cat.items) {
				expect(item.id).toBeTruthy();
				expect(item.characters).toBeTruthy();
				expect(item.pinyin).toBeTruthy();
				expect(item.en).toBeTruthy();
				expect(item.es).toBeTruthy();
				expect(Array.isArray(item.tones)).toBe(true);
			}
		}
	});
});
