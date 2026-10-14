import { describe, expect, it } from "vitest";
import {
	STROKE_EVALUATION,
	type VectorPoint,
	validateStrokePath,
} from "#lib/vector/stroke-evaluator";

const HORIZONTAL_MEDIAN: number[][] = [
	[100, 500],
	[500, 500],
	[900, 500],
];

function horizontalPath(y: number): VectorPoint[] {
	const points: VectorPoint[] = [];
	for (let index = 0; index <= 10; index += 1) {
		points.push({ x: 100 + index * 80, y });
	}
	return points;
}

describe("stroke path evaluation", () => {
	it("accepts a path that follows the median", () => {
		const result = validateStrokePath(horizontalPath(500), HORIZONTAL_MEDIAN);
		expect(result.valid).toBe(true);
		expect(result.reason).toBe("valid");
		expect(result.averageDeviation).toBeLessThanOrEqual(
			STROKE_EVALUATION.averageDeviationTolerance,
		);
	});

	it("rejects a reversed stroke", () => {
		const reversed = [...horizontalPath(500)].reverse();
		const result = validateStrokePath(reversed, HORIZONTAL_MEDIAN);
		expect(result.valid).toBe(false);
	});

	it("rejects a path that drifts off the median", () => {
		const result = validateStrokePath(horizontalPath(650), HORIZONTAL_MEDIAN);
		expect(result.valid).toBe(false);
		expect(result.reason).toBe("deviation");
		expect(result.averageDeviation).toBe(150);
	});

	it("rejects a path that does not start at the median start", () => {
		const shifted = horizontalPath(500).map((point) => ({
			x: point.x + 300,
			y: point.y,
		}));
		const result = validateStrokePath(shifted, HORIZONTAL_MEDIAN);
		expect(result.valid).toBe(false);
		expect(result.reason).toBe("start");
	});

	it("rejects an empty path", () => {
		const result = validateStrokePath([], HORIZONTAL_MEDIAN);
		expect(result.valid).toBe(false);
	});
});
