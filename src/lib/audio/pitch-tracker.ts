import { getAudioContext } from "./audio-context";
import type {
	PitchFrameMessage,
	PitchWorkerCommand,
	PitchWorkerResponse,
} from "./pitch-protocol";
import { FRAME_SIZE, HOP_SIZE_MS } from "./yin";

export type PitchFrameListener = (frame: PitchFrameMessage) => void;

export class MicPitchTracker {
	private worker: Worker | null = null;
	private stream: MediaStream | null = null;
	private analyser: AnalyserNode | null = null;
	private frame: Float32Array<ArrayBuffer> | null = null;
	private timer: ReturnType<typeof setInterval> | null = null;
	private listener: PitchFrameListener | null = null;

	async start(onFrame: PitchFrameListener): Promise<void> {
		this.listener = onFrame;
		const context = getAudioContext();

		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false,
				channelCount: 1,
			},
		});

		this.worker = new Worker(
			new URL("../workers/pitch.worker.ts", import.meta.url),
			{
				type: "module",
			},
		);
		this.worker.onmessage = (event: MessageEvent<PitchWorkerResponse>) => {
			if (event.data.status === "PITCH_FRAME") {
				this.listener?.(event.data);
			}
		};
		this.worker.postMessage({
			command: "INIT",
			sampleRate: context.sampleRate,
		} satisfies PitchWorkerCommand);

		const source = context.createMediaStreamSource(this.stream);
		this.analyser = context.createAnalyser();
		this.analyser.fftSize = FRAME_SIZE;
		source.connect(this.analyser);

		this.frame = new Float32Array(FRAME_SIZE);
		this.timer = setInterval(() => this.processFrame(), HOP_SIZE_MS);
	}

	get running(): boolean {
		return this.timer !== null;
	}

	stop(): void {
		if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}
		this.worker?.terminate();
		this.worker = null;
		for (const track of this.stream?.getTracks() ?? []) {
			track.stop();
		}
		this.stream = null;
		this.analyser = null;
		this.frame = null;
		this.listener = null;
	}

	private processFrame(): void {
		if (!this.analyser || !this.frame || !this.worker) return;
		this.analyser.getFloatTimeDomainData(this.frame);
		this.worker.postMessage({
			command: "PROCESS",
			buffer: this.frame.slice(),
		} satisfies PitchWorkerCommand);
	}
}
