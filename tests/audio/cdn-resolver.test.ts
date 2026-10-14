import { afterEach, describe, expect, it, vi } from "vitest";
import {
	AudioUnavailableError,
	fetchAudioBuffer,
	getAudioUrl,
} from "#lib/audio/cdn-resolver";

const SAMPLE_URL =
	"https://cdn.jsdelivr.net/gh/davinfifield/mp3-chinese-pinyin-sound@aa25ecce7b7fb02757b2c2b8e3c01aa975812edc/mp3";

function createAudioContextStub(): BaseAudioContext {
	return {
		decodeAudioData: async () => ({ duration: 0.25 }) as unknown as AudioBuffer,
	} as unknown as BaseAudioContext;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("getAudioUrl", () => {
	it("builds pinned CDN URLs from syllable and tone", () => {
		expect(getAudioUrl("ma", 1)).toBe(`${SAMPLE_URL}/ma1.mp3`);
		expect(getAudioUrl("ni", 3)).toBe(`${SAMPLE_URL}/ni3.mp3`);
	});

	it("maps the neutral tone to the 5 suffix", () => {
		expect(getAudioUrl("ma", 0)).toBe(`${SAMPLE_URL}/ma5.mp3`);
	});

	it("normalizes case and whitespace", () => {
		expect(getAudioUrl("  MA ", 4)).toBe(`${SAMPLE_URL}/ma4.mp3`);
	});
});

describe("fetchAudioBuffer", () => {
	it("throws AudioUnavailableError for missing files", async () => {
		vi.stubGlobal("caches", undefined);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 404 })),
		);

		await expect(
			fetchAudioBuffer(createAudioContextStub(), "qi", 0),
		).rejects.toBeInstanceOf(AudioUnavailableError);
	});

	it("reuses cached responses without hitting the network", async () => {
		const cachedResponse = new Response(new Uint8Array([1, 2, 3]).buffer, {
			status: 200,
		});
		const cache = {
			match: vi.fn(async () => cachedResponse),
			put: vi.fn(async () => undefined),
		};
		const fetchMock = vi.fn();
		vi.stubGlobal("caches", { open: vi.fn(async () => cache) });
		vi.stubGlobal("fetch", fetchMock);

		await fetchAudioBuffer(createAudioContextStub(), "ma", 1);

		expect(fetchMock).not.toHaveBeenCalled();
		expect(cache.put).not.toHaveBeenCalled();
	});

	it("populates the cache on a miss", async () => {
		const cache = {
			match: vi.fn(async () => undefined),
			put: vi.fn(async () => undefined),
		};
		const fetchMock = vi.fn(
			async () =>
				new Response(new Uint8Array([4, 5, 6]).buffer, { status: 200 }),
		);
		vi.stubGlobal("caches", { open: vi.fn(async () => cache) });
		vi.stubGlobal("fetch", fetchMock);

		await fetchAudioBuffer(createAudioContextStub(), "ma", 1);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cache.put).toHaveBeenCalledTimes(1);
	});

	it("works without the Cache API available", async () => {
		vi.stubGlobal("caches", undefined);
		const fetchMock = vi.fn(
			async () => new Response(new Uint8Array([7]).buffer, { status: 200 }),
		);
		vi.stubGlobal("fetch", fetchMock);

		const buffer = await fetchAudioBuffer(createAudioContextStub(), "ma", 1);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(buffer.duration).toBe(0.25);
	});
});
