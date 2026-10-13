export interface WavData {
	sampleRate: number;
	samples: Float32Array;
}

function readAscii(view: DataView, offset: number, length: number): string {
	let text = "";
	for (let index = 0; index < length; index++) {
		text += String.fromCharCode(view.getUint8(offset + index));
	}
	return text;
}

export function parseWav(data: ArrayBuffer): WavData {
	const view = new DataView(data);
	if (readAscii(view, 0, 4) !== "RIFF" || readAscii(view, 8, 4) !== "WAVE") {
		throw new Error("Not a RIFF/WAVE file");
	}

	let offset = 12;
	let sampleRate = 0;
	let channels = 1;
	let bitsPerSample = 16;
	let dataOffset = -1;
	let dataSize = 0;

	while (offset + 8 <= view.byteLength) {
		const chunkId = readAscii(view, offset, 4);
		const chunkSize = view.getUint32(offset + 4, true);
		const body = offset + 8;

		if (chunkId === "fmt ") {
			channels = view.getUint16(body + 2, true);
			sampleRate = view.getUint32(body + 4, true);
			bitsPerSample = view.getUint16(body + 14, true);
		} else if (chunkId === "data") {
			dataOffset = body;
			dataSize = chunkSize;
		}

		offset = body + chunkSize + (chunkSize % 2);
	}

	if (dataOffset < 0 || sampleRate === 0) {
		throw new Error("Malformed WAV file: missing fmt or data chunk");
	}
	if (bitsPerSample !== 16 || channels !== 1) {
		throw new Error(
			`Unsupported WAV format: ${bitsPerSample}-bit, ${channels} channel(s)`,
		);
	}

	const sampleCount = Math.floor(dataSize / 2);
	const samples = new Float32Array(sampleCount);
	for (let index = 0; index < sampleCount; index++) {
		samples[index] = view.getInt16(dataOffset + index * 2, true) / 32768;
	}

	return { sampleRate, samples };
}
