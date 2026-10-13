import { describe, expect, it } from "vitest";
import type { ContourPoint } from "#lib/audio/yin";
import { evaluateContour, SCORING } from "#lib/dsp/scoring";

function contour(frequencies: number[]): ContourPoint[] {
	return frequencies.map((frequency, index) => ({
		timeMs: index * 20,
		frequency,
	}));
}

function rising(from: number, to: number, points = 40): number[] {
	return Array.from(
		{ length: points },
		(_, index) => from * (to / from) ** (index / (points - 1)),
	);
}

describe("evaluateContour", () => {
	it("scores a perfect match at 100", () => {
		const reference = contour(rising(140, 280));
		const result = evaluateContour(reference, reference);
		expect(result).not.toBeNull();
		expect(result?.score).toBe(100);
		expect(result?.passed).toBe(true);
		expect(result?.correlation).toBeGreaterThan(0.99);
	});

	it("scores an inverted contour poorly", () => {
		const reference = contour(rising(140, 280));
		const inverted = contour([...rising(140, 280)].reverse());
		const result = evaluateContour(inverted, reference);
		expect(result).not.toBeNull();
		expect(result?.score).toBeLessThan(50);
		expect(result?.passed).toBe(false);
	});

	it("normalizes the speaker's absolute pitch level", () => {
		const reference = contour(rising(140, 280));
		const shifted = reference.map((point) => ({
			timeMs: point.timeMs,
			frequency: point.frequency * 2 ** (5 / 12),
		}));
		const result = evaluateContour(shifted, reference);
		expect(result).not.toBeNull();
		expect(result?.score).toBe(100);
	});

	it("penalizes a smaller pitch range", () => {
		const reference = contour(rising(140, 280));
		const flattened = contour(rising(140, 155));
		const result = evaluateContour(flattened, reference);
		expect(result).not.toBeNull();
		expect(result?.score).toBeLessThan(SCORING.passThreshold);
	});

	it("returns null when there are too few voiced points", () => {
		const reference = contour(rising(140, 280));
		const sparse = contour([150, 160, 170, 180]);
		expect(evaluateContour(sparse, reference)).toBeNull();
	});
});
