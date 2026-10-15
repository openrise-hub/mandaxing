import { describe, expect, it } from "vitest";
import HanziEmblem from "#lib/components/emblems/HanziEmblem.svelte";
import ReaderEmblem from "#lib/components/emblems/ReaderEmblem.svelte";
import ReviewEmblem from "#lib/components/emblems/ReviewEmblem.svelte";
import SentencesEmblem from "#lib/components/emblems/SentencesEmblem.svelte";
import TonesEmblem from "#lib/components/emblems/TonesEmblem.svelte";
import VocabularyEmblem from "#lib/components/emblems/VocabularyEmblem.svelte";

describe("tactile emblem components", () => {
	it("exports all 6 study emblems", () => {
		expect(TonesEmblem).toBeDefined();
		expect(HanziEmblem).toBeDefined();
		expect(SentencesEmblem).toBeDefined();
		expect(VocabularyEmblem).toBeDefined();
		expect(ReviewEmblem).toBeDefined();
		expect(ReaderEmblem).toBeDefined();
	});
});
