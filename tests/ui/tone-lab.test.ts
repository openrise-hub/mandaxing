import { describe, expect, it } from "vitest";
import ToneLabView from "#lib/components/ToneLabView.svelte";
import { lab } from "#lib/state/tone-lab.svelte";

describe("ToneLabView component", () => {
	it("exports ToneLabView component definition", () => {
		expect(ToneLabView).toBeDefined();
	});

	it("initializes with valid default mode and stimuli", () => {
		expect(lab.mode).toBeDefined();
		expect(lab.wordItems.length).toBeGreaterThan(0);
	});

	it("allows mode switching between single, pairs, and minimal", () => {
		lab.setMode("pairs");
		expect(lab.mode).toBe("pairs");
		lab.setMode("minimal");
		expect(lab.mode).toBe("minimal");
		lab.setMode("single");
		expect(lab.mode).toBe("single");
	});
});
