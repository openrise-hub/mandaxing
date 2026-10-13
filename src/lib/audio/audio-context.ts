let audioContext: AudioContext | undefined;

export function getAudioContext(): AudioContext {
	if (!audioContext) {
		audioContext = new AudioContext();
	}
	return audioContext;
}

export async function resumeAudioContext(): Promise<AudioContext> {
	const context = getAudioContext();
	if (context.state === "suspended") {
		await context.resume();
	}
	return context;
}
