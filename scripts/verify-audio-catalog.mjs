import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "lib", "data");

const CDN_BASE_URL =
	"https://cdn.jsdelivr.net/gh/davinfifield/mp3-chinese-pinyin-sound@aa25ecce7b7fb02757b2c2b8e3c01aa975812edc/mp3";

const isolated = JSON.parse(
	readFileSync(join(dataDir, "isolated-tones.json"), "utf8"),
);
const pairs = JSON.parse(
	readFileSync(join(dataDir, "tone-pairs.json"), "utf8"),
);
const minimal = JSON.parse(
	readFileSync(join(dataDir, "minimal-pairs.json"), "utf8"),
);
const bank = JSON.parse(
	readFileSync(join(dataDir, "bank-01-pronouns.json"), "utf8"),
);

const slugs = new Map();

function add(syllable, tone, label) {
	const key = `${syllable}${tone === 0 ? 5 : tone}`;
	if (!slugs.has(key)) {
		slugs.set(key, label);
	}
}

for (const item of isolated) {
	for (const variant of item.tones) {
		add(item.syllable, variant.tone, item.id);
	}
}
for (const item of pairs) {
	item.syllables.forEach((syllable, index) => {
		add(syllable, item.tones[index], `${item.pair} ${item.hanzi}`);
	});
}
for (const item of minimal) {
	add(item.itemA.syllable, item.itemA.tone, item.id);
	add(item.itemB.syllable, item.itemB.tone, item.id);
}
for (const item of bank) {
	item.syllables.forEach((syllable, index) => {
		add(syllable, item.tones[index], `${item.id} ${item.characters}`);
	});
}

const missing = [];
let available = 0;

for (const [key, label] of [...slugs.entries()].sort(([a], [b]) =>
	a.localeCompare(b),
)) {
	const response = await fetch(`${CDN_BASE_URL}/${key}.mp3`, {
		method: "HEAD",
	});
	if (response.ok) {
		available++;
	} else {
		missing.push(`${key}.mp3 (${label}) [HTTP ${response.status}]`);
	}
}

console.log(
	`Audio catalog reachability: ${available}/${slugs.size} files available`,
);
if (missing.length > 0) {
	console.log("Missing files:");
	for (const entry of missing) {
		console.log(`  - ${entry}`);
	}
	process.exitCode = 1;
} else {
	console.log("All dataset syllables resolve to CDN files.");
}
