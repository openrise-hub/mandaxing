const CDN_BASE_URL = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1";
const CACHE_NAME = "mandaxing-hanzi-cache-v1";

export interface HanziStrokeData {
	strokes: string[];
	medians: number[][][];
}

export class HanziDataUnavailableError extends Error {
	readonly character: string;

	constructor(character: string) {
		super(`Hanzi data unavailable: ${character}`);
		this.name = "HanziDataUnavailableError";
		this.character = character;
	}
}

export function getHanziDataUrl(character: string): string {
	return `${CDN_BASE_URL}/${encodeURIComponent(character)}.json`;
}

async function openCache(): Promise<Cache | undefined> {
	if (typeof caches === "undefined") return undefined;
	try {
		return await caches.open(CACHE_NAME);
	} catch {
		return undefined;
	}
}

function parseMedian(character: string, value: unknown): number[][] {
	if (!Array.isArray(value) || value.length === 0) {
		throw new HanziDataUnavailableError(character);
	}
	return value.map((pair) => {
		if (
			!Array.isArray(pair) ||
			pair.length !== 2 ||
			typeof pair[0] !== "number" ||
			typeof pair[1] !== "number" ||
			!Number.isFinite(pair[0]) ||
			!Number.isFinite(pair[1])
		) {
			throw new HanziDataUnavailableError(character);
		}
		return [pair[0], pair[1]];
	});
}

function parseStrokeData(character: string, payload: unknown): HanziStrokeData {
	if (typeof payload !== "object" || payload === null) {
		throw new HanziDataUnavailableError(character);
	}
	const data = payload as { strokes?: unknown; medians?: unknown };
	if (!Array.isArray(data.strokes) || !Array.isArray(data.medians)) {
		throw new HanziDataUnavailableError(character);
	}
	const strokes = data.strokes.map((stroke) => {
		if (typeof stroke !== "string" || stroke.length === 0) {
			throw new HanziDataUnavailableError(character);
		}
		return stroke;
	});
	const medians = data.medians.map((median) => parseMedian(character, median));
	if (strokes.length === 0 || strokes.length !== medians.length) {
		throw new HanziDataUnavailableError(character);
	}
	return { strokes, medians };
}

export async function fetchHanziData(
	character: string,
): Promise<HanziStrokeData> {
	const url = getHanziDataUrl(character);
	const cache = await openCache();
	const cached = await cache?.match(url);

	const response = cached ?? (await fetch(url, { mode: "cors" }));
	if (!response.ok) {
		throw new HanziDataUnavailableError(character);
	}
	if (!cached && cache) {
		await cache.put(url, response.clone());
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		throw new HanziDataUnavailableError(character);
	}
	return parseStrokeData(character, payload);
}
