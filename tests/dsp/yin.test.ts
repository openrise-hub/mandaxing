import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeContour } from "#lib/audio/yin";
import { parseWav } from "../utils/wav";

function loadFixture(name: string): {
	sampleRate: number;
	samples: Float32Array;
} {
	const buffer = readFileSync(
		new URL(`../fixtures/audio/${name}`, import.meta.url),
	);
	const arrayBuffer = buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	);
	return parseWav(arrayBuffer as ArrayBuffer);
}

function averageVoiced(frequencies: number[]): number {
	const voiced = frequencies.filter((frequency) => frequency > 0);
	const middle = voiced.slice(
		Math.floor(voiced.length * 0.2),
		Math.ceil(voiced.length * 0.8),
	);
	return middle.reduce((sum, value) => sum + value, 0) / middle.length;
}

describe("YIN pitch detection", () => {
	it("resolves a 220 Hz sine within ±2 Hz", () => {
		const { sampleRate, samples } = loadFixture("sine-220hz.wav");
		const frequencies = analyzeContour(samples, sampleRate).map(
			(point) => point.frequency,
		);
		expect(averageVoiced(frequencies)).toBeGreaterThanOrEqual(218);
		expect(averageVoiced(frequencies)).toBeLessThanOrEqual(222);
	});

	it("resolves a 440 Hz sine within ±2 Hz", () => {
		const { sampleRate, samples } = loadFixture("sine-440hz.wav");
		const frequencies = analyzeContour(samples, sampleRate).map(
			(point) => point.frequency,
		);
		expect(averageVoiced(frequencies)).toBeGreaterThanOrEqual(438);
		expect(averageVoiced(frequencies)).toBeLessThanOrEqual(442);
	});

	it("tracks an ascending glide", () => {
		const { sampleRate, samples } = loadFixture("glide-110-440hz.wav");
		const frequencies = analyzeContour(samples, sampleRate).map(
			(point) => point.frequency,
		);
		const voiced = frequencies.filter((frequency) => frequency > 0);
		const firstHalf = voiced.slice(0, Math.floor(voiced.length / 2));
		const secondHalf = voiced.slice(Math.floor(voiced.length / 2));
		const firstAverage =
			firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
		const secondAverage =
			secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
		expect(secondAverage).toBeGreaterThan(firstAverage * 1.5);
	});

	it("reports silence as unvoiced", () => {
		const silence = new Float32Array(44100).fill(0);
		const frequencies = analyzeContour(silence, 44100).map(
			(point) => point.frequency,
		);
		expect(frequencies.every((frequency) => frequency === 0)).toBe(true);
	});
});
