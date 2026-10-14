export interface InitCommand {
	command: "INIT";
	sampleRate: number;
}

export interface ProcessCommand {
	command: "PROCESS";
	buffer: Float32Array;
}

export type PitchWorkerCommand = InitCommand | ProcessCommand;

export interface ReadyMessage {
	status: "READY";
	frameSize: number;
	hopSizeMs: number;
}

export interface PitchFrameMessage {
	status: "PITCH_FRAME";
	frequency: number;
	timestamp: number;
}

export type PitchWorkerResponse = ReadyMessage | PitchFrameMessage;
