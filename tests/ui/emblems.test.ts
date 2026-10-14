import { describe, expect, it } from "vitest";
import HanziEmblem from "#lib/components/emblems/HanziEmblem.svelte";
import SentencesEmblem from "#lib/components/emblems/SentencesEmblem.svelte";
import TonesEmblem from "#lib/components/emblems/TonesEmblem.svelte";
import VocabularyEmblem from "#lib/components/emblems/VocabularyEmblem.svelte";

describe("tactile emblem components", () => {
	it("exports all 4 study emblems", () => {
		expect(TonesEmblem).toBeDefined();
		expect(HanziEmblem).toBeDefined();
		expect(SentencesEmblem).toBeDefined();
		expect(VocabularyEmblem).toBeDefined();
	});
});
