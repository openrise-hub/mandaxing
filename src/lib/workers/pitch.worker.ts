/// <reference lib="webworker" />
import type {
	PitchFrameMessage,
	PitchWorkerCommand,
	ReadyMessage,
} from "../audio/pitch-protocol";
import { createPitchDetector, FRAME_SIZE, HOP_SIZE_MS } from "../audio/yin";

const scope = self as unknown as DedicatedWorkerGlobalScope;

let detectPitch: ((buffer: Float32Array) => number | null) | null = null;

scope.onmessage = (event: MessageEvent<PitchWorkerCommand>) => {
	const message = event.data;

	if (message.command === "INIT") {
		detectPitch = createPitchDetector(message.sampleRate);
		scope.postMessage({
			status: "READY",
			frameSize: FRAME_SIZE,
			hopSizeMs: HOP_SIZE_MS,
		} satisfies ReadyMessage);
		return;
	}

	if (message.command === "PROCESS" && detectPitch) {
		const frequency = detectPitch(message.buffer) ?? 0;
		scope.postMessage({
			status: "PITCH_FRAME",
			frequency,
			timestamp: performance.now(),
		} satisfies PitchFrameMessage);
	}
};
