import { describe, expect, it } from "vitest";
import MizigeVisual from "#lib/components/shapes/MizigeVisual.svelte";
import ReaderVisual from "#lib/components/shapes/ReaderVisual.svelte";
import ReviewVisual from "#lib/components/shapes/ReviewVisual.svelte";
import SentenceVisual from "#lib/components/shapes/SentenceVisual.svelte";
import SerpentineRibbon from "#lib/components/shapes/SerpentineRibbon.svelte";
import TonesVisual from "#lib/components/shapes/TonesVisual.svelte";
import VocabularyVisual from "#lib/components/shapes/VocabularyVisual.svelte";

describe("retrofuturistic shape visual components", () => {
	it("exports all shape components successfully", () => {
		expect(SerpentineRibbon).toBeDefined();
		expect(TonesVisual).toBeDefined();
		expect(MizigeVisual).toBeDefined();
		expect(SentenceVisual).toBeDefined();
		expect(VocabularyVisual).toBeDefined();
		expect(ReviewVisual).toBeDefined();
		expect(ReaderVisual).toBeDefined();
	});
});
