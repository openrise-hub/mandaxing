import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const targetFile = join(
	here,
	"..",
	"src",
	"lib",
	"data",
	"isolated-tones.json",
);

const toneVowels = {
	a: ["ā", "á", "ǎ", "à"],
	e: ["ē", "é", "ě", "è"],
	o: ["ō", "ó", "ǒ", "ò"],
	i: ["ī", "í", "ǐ", "ì"],
	u: ["ū", "ú", "ǔ", "ù"],
	v: ["ǖ", "ǘ", "ǚ", "ǜ"],
	ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function addToneToPinyin(syllable, tone) {
	if (tone === 0 || tone === 5) return syllable.replace("v", "ü");
	const tIdx = tone - 1;
	const s = syllable.toLowerCase();
	if (s.includes("a")) return s.replace("a", toneVowels.a[tIdx]);
	if (s.includes("e")) return s.replace("e", toneVowels.e[tIdx]);
	if (s.includes("ou")) return s.replace("o", toneVowels.o[tIdx]);
	const lastVowel = [...s].findLastIndex((ch) => "aeoiuvü".includes(ch));
	if (lastVowel !== -1) {
		const v = s[lastVowel];
		return s.slice(0, lastVowel) + toneVowels[v][tIdx] + s.slice(lastVowel + 1);
	}
	return s;
}

const response = await fetch(
	"https://data.jsdelivr.com/v1/package/gh/davinfifield/mp3-chinese-pinyin-sound@1.0",
);
const data = await response.json();
const mp3Dir = data.files.find((f) => f.name === "mp3");
if (!mp3Dir) {
	throw new Error("mp3 directory not found");
}

const sylMap = new Map();
for (const file of mp3Dir.files) {
	const match = file.name.match(/^([a-z]+)([1-5])\.mp3$/);
	if (!match) continue;
	const rawSyl = match[1];
	const toneNum = Number.parseInt(match[2], 10);
	const tone = toneNum === 5 ? 0 : toneNum;

	if (!sylMap.has(rawSyl)) {
		sylMap.set(rawSyl, []);
	}
	sylMap.get(rawSyl).push({
		tone,
		pinyin: addToneToPinyin(rawSyl, tone),
	});
}

const items = [];
for (const [syllable, tones] of [...sylMap.entries()].sort(([a], [b]) =>
	a.localeCompare(b),
)) {
	tones.sort((a, b) => {
		const at = a.tone === 0 ? 5 : a.tone;
		const bt = b.tone === 0 ? 5 : b.tone;
		return at - bt;
	});
	items.push({
		id: `syl_${syllable}`,
		syllable,
		tones,
	});
}

writeFileSync(targetFile, `${JSON.stringify(items, null, "\t")}\n`, "utf8");
console.log(
	`Wrote ${items.length} syllables (${items.reduce((acc, it) => acc + it.tones.length, 0)} tones) to isolated-tones.json`,
);
