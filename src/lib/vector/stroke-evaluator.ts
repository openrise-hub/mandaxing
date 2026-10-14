export interface VectorPoint {
	x: number;
	y: number;
}

export const STROKE_EVALUATION = {
	averageDeviationTolerance: 85,
	endpointTolerance: 220,
} as const;

export type StrokeEvaluationReason = "valid" | "start" | "end" | "deviation";

export interface StrokeEvaluation {
	valid: boolean;
	reason: StrokeEvaluationReason;
	averageDeviation: number;
	startDistance: number;
	endDistance: number;
}

function pointToSegmentDistance(
	point: VectorPoint,
	start: VectorPoint,
	end: VectorPoint,
): number {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const lengthSquared = dx * dx + dy * dy;
	if (lengthSquared === 0) {
		return Math.hypot(point.x - start.x, point.y - start.y);
	}
	const t = Math.max(
		0,
		Math.min(
			1,
			((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
		),
	);
	return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function pointToPolylineDistance(
	point: VectorPoint,
	polyline: VectorPoint[],
): number {
	if (polyline.length === 0) return Number.POSITIVE_INFINITY;
	let minimum = Number.POSITIVE_INFINITY;
	for (let index = 0; index < polyline.length - 1; index += 1) {
		const start = polyline[index];
		const end = polyline[index + 1];
		if (!start || !end) continue;
		minimum = Math.min(minimum, pointToSegmentDistance(point, start, end));
	}
	if (minimum === Number.POSITIVE_INFINITY) {
		const only = polyline[0];
		if (!only) return Number.POSITIVE_INFINITY;
		return Math.hypot(point.x - only.x, point.y - only.y);
	}
	return minimum;
}

function toPoints(median: number[][]): VectorPoint[] {
	return median.flatMap((pair) => {
		const x = pair[0];
		const y = pair[1];
		return typeof x === "number" && typeof y === "number" ? [{ x, y }] : [];
	});
}

export function validateStrokePath(
	path: VectorPoint[],
	median: number[][],
): StrokeEvaluation {
	const target = toPoints(median);
	const first = path[0];
	const last = path[path.length - 1];
	const start = target[0];
	const end = target[target.length - 1];
	if (!first || !last || !start || !end || path.length < 2) {
		return {
			valid: false,
			reason: "deviation",
			averageDeviation: Number.POSITIVE_INFINITY,
			startDistance: Number.POSITIVE_INFINITY,
			endDistance: Number.POSITIVE_INFINITY,
		};
	}
	const startDistance = Math.hypot(first.x - start.x, first.y - start.y);
	const endDistance = Math.hypot(last.x - end.x, last.y - end.y);
	const totalDeviation = path.reduce(
		(sum, point) => sum + pointToPolylineDistance(point, target),
		0,
	);
	const averageDeviation = totalDeviation / path.length;
	const evaluation = { averageDeviation, startDistance, endDistance };
	if (startDistance > STROKE_EVALUATION.endpointTolerance) {
		return { valid: false, reason: "start", ...evaluation };
	}
	if (endDistance > STROKE_EVALUATION.endpointTolerance) {
		return { valid: false, reason: "end", ...evaluation };
	}
	if (averageDeviation > STROKE_EVALUATION.averageDeviationTolerance) {
		return { valid: false, reason: "deviation", ...evaluation };
	}
	return { valid: true, reason: "valid", ...evaluation };
}
