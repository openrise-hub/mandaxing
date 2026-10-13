const CDN_BASE_URL =
	"https://cdn.jsdelivr.net/gh/davinfifield/mp3-chinese-pinyin-sound@aa25ecce7b7fb02757b2c2b8e3c01aa975812edc/mp3";
const CACHE_NAME = "mandaxing-audio-cache-v1";

export class AudioUnavailableError extends Error {
	readonly syllable: string;
	readonly tone: number;

	constructor(syllable: string, tone: number) {
		super(`Audio unavailable: ${syllable} (tone ${tone})`);
		this.name = "AudioUnavailableError";
		this.syllable = syllable;
		this.tone = tone;
	}
}

export function getAudioUrl(syllable: string, tone: number): string {
	const normalizedSyllable = syllable.toLowerCase().trim();
	const toneNumber = tone === 0 ? 5 : tone;
	return `${CDN_BASE_URL}/${normalizedSyllable}${toneNumber}.mp3`;
}

async function openCache(): Promise<Cache | undefined> {
	if (typeof caches === "undefined") return undefined;
	try {
		return await caches.open(CACHE_NAME);
	} catch {
		return undefined;
	}
}

export async function fetchAudioBuffer(
	audioContext: BaseAudioContext,
	syllable: string,
	tone: number,
): Promise<AudioBuffer> {
	const url = getAudioUrl(syllable, tone);
	const cache = await openCache();
	const cached = await cache?.match(url);

	const response = cached ?? (await fetch(url, { mode: "cors" }));
	if (!response.ok) {
		throw new AudioUnavailableError(syllable, tone);
	}
	if (!cached && cache) {
		await cache.put(url, response.clone());
	}

	return audioContext.decodeAudioData(await response.arrayBuffer());
}
