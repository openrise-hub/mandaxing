import { YIN } from "pitchfinder";

export const FRAME_SIZE = 2048;
export const HOP_SIZE_MS = 20;
export const MIN_FREQUENCY_HZ = 65;
export const MAX_FREQUENCY_HZ = 500;

export interface ContourPoint {
	timeMs: number;
	frequency: number;
}

export function createPitchDetector(
	sampleRate: number,
): (buffer: Float32Array) => number | null {
	const detect = YIN({ sampleRate, threshold: 0.1 });
	return (buffer: Float32Array) => {
		const frequency = detect(buffer);
		if (
			frequency &&
			frequency >= MIN_FREQUENCY_HZ &&
			frequency <= MAX_FREQUENCY_HZ
		) {
			return frequency;
		}
		return null;
	};
}

export function analyzeContour(
	samples: Float32Array,
	sampleRate: number,
	hopMs = HOP_SIZE_MS,
): ContourPoint[] {
	const detect = createPitchDetector(sampleRate);
	const hopSize = Math.max(1, Math.round((sampleRate * hopMs) / 1000));
	const points: ContourPoint[] = [];

	for (let start = 0; start + FRAME_SIZE <= samples.length; start += hopSize) {
		const frame = samples.subarray(start, start + FRAME_SIZE);
		points.push({
			timeMs: (start / sampleRate) * 1000,
			frequency: detect(frame) ?? 0,
		});
	}

	return points;
}
