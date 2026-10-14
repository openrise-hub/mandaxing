import type { ContourPoint } from "../audio/yin";

export const SCORING = {
	correlationWeight: 0.5,
	levelWeight: 0.5,
	rmseToleranceSemitones: 3,
	passThreshold: 80,
	resamplePoints: 64,
	minVoicedPoints: 10,
} as const;

export interface ScoreResult {
	score: number;
	passed: boolean;
	correlation: number;
	rmseSemitones: number;
}

function voicedFrequencies(contour: ContourPoint[]): number[] {
	return contour
		.filter((point) => point.frequency > 0)
		.map((point) => point.frequency);
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
	return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function toSemitones(frequencies: number[], center: number): number[] {
	return frequencies.map((frequency) => 12 * Math.log2(frequency / center));
}

function resampleSeries(series: number[], targetLength: number): number[] {
	if (series.length === 0) return [];
	if (series.length === 1)
		return new Array<number>(targetLength).fill(series[0] ?? 0);
	const result: number[] = [];
	for (let index = 0; index < targetLength; index++) {
		const position = (index / (targetLength - 1)) * (series.length - 1);
		const lower = Math.floor(position);
		const upper = Math.min(series.length - 1, lower + 1);
		const weight = position - lower;
		result.push(
			(series[lower] ?? 0) * (1 - weight) + (series[upper] ?? 0) * weight,
		);
	}
	return result;
}

function pearson(a: number[], b: number[]): number {
	const meanA = a.reduce((sum, value) => sum + value, 0) / a.length;
	const meanB = b.reduce((sum, value) => sum + value, 0) / b.length;
	let covariance = 0;
	let varianceA = 0;
	let varianceB = 0;
	for (let index = 0; index < a.length; index++) {
		const deviationA = (a[index] ?? 0) - meanA;
		const deviationB = (b[index] ?? 0) - meanB;
		covariance += deviationA * deviationB;
		varianceA += deviationA * deviationA;
		varianceB += deviationB * deviationB;
	}
	if (varianceA === 0 || varianceB === 0) return 0;
	return covariance / Math.sqrt(varianceA * varianceB);
}

export function evaluateContour(
	userContour: ContourPoint[],
	referenceContour: ContourPoint[],
	config = SCORING,
): ScoreResult | null {
	const userFrequencies = voicedFrequencies(userContour);
	const referenceFrequencies = voicedFrequencies(referenceContour);
	if (
		userFrequencies.length < config.minVoicedPoints ||
		referenceFrequencies.length < config.minVoicedPoints
	) {
		return null;
	}

	const userSeries = resampleSeries(
		toSemitones(userFrequencies, median(userFrequencies)),
		config.resamplePoints,
	);
	const referenceSeries = resampleSeries(
		toSemitones(referenceFrequencies, median(referenceFrequencies)),
		config.resamplePoints,
	);

	const correlation = pearson(userSeries, referenceSeries);
	const rmseSemitones = Math.sqrt(
		userSeries.reduce(
			(sum, value, index) => sum + (value - (referenceSeries[index] ?? 0)) ** 2,
			0,
		) / userSeries.length,
	);

	const score = Math.round(
		100 *
			(config.correlationWeight * Math.max(0, correlation) +
				config.levelWeight *
					Math.max(0, 1 - rmseSemitones / config.rmseToleranceSemitones)),
	);

	return {
		score,
		passed: score >= config.passThreshold,
		correlation,
		rmseSemitones,
	};
}
