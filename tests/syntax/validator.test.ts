import { describe, expect, it } from "vitest";
import sentencesData from "#lib/data/syntax-sentences.json";
import {
	type SyntaxSentence,
	validateRoleOrdering,
	validateSentenceAssembly,
} from "#lib/syntax/validator";

const sentences = sentencesData as SyntaxSentence[];

describe("Mandarin sentence syntax order validator", () => {
	it("validates canonical Subject + Time + Location + Verb + Object order", () => {
		const result = validateRoleOrdering([
			"subject",
			"time",
			"location",
			"verb",
			"object",
		]);
		expect(result.valid).toBe(true);
	});

	it("validates time-fronted Time + Subject + Location + Verb + Object order", () => {
		const result = validateRoleOrdering([
			"time",
			"subject",
			"location",
			"verb",
			"object",
		]);
		expect(result.valid).toBe(true);
	});

	it("detects and rejects post-verbal time expressions with informative hint", () => {
		const result = validateRoleOrdering(["subject", "verb", "time", "object"]);
		expect(result.valid).toBe(false);
		expect(result.reasonEn).toContain("time words must precede");
		expect(result.reasonEs).toContain("tiempo deben colocarse antes");
	});

	it("detects and rejects post-verbal location expressions with informative hint", () => {
		const result = validateRoleOrdering(["subject", "verb", "location"]);
		expect(result.valid).toBe(false);
		expect(result.reasonEn).toContain("location (zai + place) precedes");
	});
});

describe("Sentence drill assembly validation", () => {
	const s1 = (sentences[0] ?? {}) as SyntaxSentence;

	it("validates exact target sequence completion", () => {
		const result = validateSentenceAssembly(s1.targetOrder, s1);
		expect(result.valid).toBe(true);
		expect(result.completed).toBe(true);
	});

	it("validates allowed alternative time-fronted sequence", () => {
		const alt = s1.allowedAlternatives?.[0] ?? [];
		const result = validateSentenceAssembly(alt, s1);
		expect(result.valid).toBe(true);
		expect(result.completed).toBe(true);
	});

	it("identifies partial prefix progress without marking complete", () => {
		const partial = s1.targetOrder.slice(0, 2);
		const result = validateSentenceAssembly(partial, s1);
		expect(result.valid).toBe(true);
		expect(result.completed).toBe(false);
	});

	it("flags order mismatch with index indicator", () => {
		const wrongOrder = ["w_shui", "w_wo", "w_jintian", "w_he"];
		const result = validateSentenceAssembly(wrongOrder, s1);
		expect(result.valid).toBe(false);
		expect(result.mismatchIndex).toBe(0);
	});
});
