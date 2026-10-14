import { fetchAudioBuffer } from "./cdn-resolver";
import { analyzeContour, type ContourPoint } from "./yin";

export interface SyllableSpec {
	syllable: string;
	tone: number;
}

export const SEQUENCE_GAP_MS = 60;

export async function fetchSequence(
	audioContext: BaseAudioContext,
	specs: SyllableSpec[],
): Promise<AudioBuffer[]> {
	return Promise.all(
		specs.map(({ syllable, tone }) =>
			fetchAudioBuffer(audioContext, syllable, tone),
		),
	);
}

export function sequenceDurationMs(buffers: AudioBuffer[]): number {
	const speechMs = buffers.reduce(
		(total, buffer) => total + buffer.duration * 1000,
		0,
	);
	const gapMs = Math.max(0, buffers.length - 1) * SEQUENCE_GAP_MS;
	return speechMs + gapMs;
}

export async function playSequence(
	audioContext: BaseAudioContext,
	buffers: AudioBuffer[],
): Promise<number> {
	const startAt = audioContext.currentTime + 0.05;
	let cursor = startAt;
	for (const buffer of buffers) {
		const source = audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(audioContext.destination);
		source.start(cursor);
		cursor += buffer.duration + SEQUENCE_GAP_MS / 1000;
	}

	const totalMs = (cursor - startAt) * 1000;
	await new Promise<void>((resolve) => setTimeout(resolve, totalMs));
	return totalMs;
}

export function extractReferenceContour(
	buffers: AudioBuffer[],
): ContourPoint[] {
	const points: ContourPoint[] = [];
	let offsetMs = 0;

	for (const buffer of buffers) {
		const contour = analyzeContour(buffer.getChannelData(0), buffer.sampleRate);
		for (const point of contour) {
			points.push({
				timeMs: point.timeMs + offsetMs,
				frequency: point.frequency,
			});
		}
		offsetMs += buffer.duration * 1000 + SEQUENCE_GAP_MS;
	}

	return points;
}
