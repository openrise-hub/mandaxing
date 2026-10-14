import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const AMPLITUDE = 0.8;
const FADE_MS = 20;

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, "..", "tests", "fixtures", "audio");

function envelope(index, total) {
	const fadeSamples = Math.round((SAMPLE_RATE * FADE_MS) / 1000);
	const rising = Math.min(1, index / fadeSamples);
	const falling = Math.min(1, (total - 1 - index) / fadeSamples);
	return Math.min(rising, falling);
}

function sine(frequency, seconds) {
	const total = Math.round(SAMPLE_RATE * seconds);
	const samples = new Float32Array(total);
	for (let index = 0; index < total; index++) {
		const value = Math.sin((2 * Math.PI * frequency * index) / SAMPLE_RATE);
		samples[index] = AMPLITUDE * envelope(index, total) * value;
	}
	return samples;
}

function glide(fromHz, toHz, seconds) {
	const total = Math.round(SAMPLE_RATE * seconds);
	const samples = new Float32Array(total);
	const startLog = Math.log2(fromHz);
	const endLog = Math.log2(toHz);
	let phase = 0;
	for (let index = 0; index < total; index++) {
		const progress = index / (total - 1);
		const frequency = 2 ** (startLog + (endLog - startLog) * progress);
		phase += (2 * Math.PI * frequency) / SAMPLE_RATE;
		samples[index] = AMPLITUDE * envelope(index, total) * Math.sin(phase);
	}
	return samples;
}

function writeWav(filePath, samples) {
	const sampleCount = samples.length;
	const buffer = Buffer.alloc(44 + sampleCount * 2);

	buffer.write("RIFF", 0, "ascii");
	buffer.writeUInt32LE(36 + sampleCount * 2, 4);
	buffer.write("WAVE", 8, "ascii");
	buffer.write("fmt ", 12, "ascii");
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(1, 22);
	buffer.writeUInt32LE(SAMPLE_RATE, 24);
	buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
	buffer.writeUInt16LE(2, 32);
	buffer.writeUInt16LE(16, 34);
	buffer.write("data", 36, "ascii");
	buffer.writeUInt32LE(sampleCount * 2, 40);

	for (let index = 0; index < sampleCount; index++) {
		const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0));
		buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
	}

	writeFileSync(filePath, buffer);
}

mkdirSync(outputDir, { recursive: true });

writeWav(join(outputDir, "sine-220hz.wav"), sine(220, 0.5));
writeWav(join(outputDir, "sine-440hz.wav"), sine(440, 0.5));
writeWav(join(outputDir, "glide-110-440hz.wav"), glide(110, 440, 0.6));

console.log(`Audio fixtures written to ${outputDir}`);
