<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const sampleWords = [
		{ char: "你", pinyin: "nǐ", toneColor: "var(--color-tone-3, #DC2626)" },
		{ char: "好", pinyin: "hǎo", toneColor: "var(--color-tone-3, #DC2626)" },
		{ char: "是", pinyin: "shì", toneColor: "var(--color-tone-4, #7F1D1D)" },
		{ char: "吃", pinyin: "chī", toneColor: "var(--color-tone-1, #F59E0B)" },
		{ char: "来", pinyin: "lái", toneColor: "var(--color-tone-2, #EA580C)" },
		{ char: "水", pinyin: "shuǐ", toneColor: "var(--color-tone-3, #DC2626)" }
	];
</script>

<div class="grid grid-cols-3 gap-1.5 w-full {className}">
	{#each sampleWords as item}
		<div class="flex flex-col items-center justify-center p-1.5 bg-paper/50 border border-ink/15 rounded-xs">
			<span class="hanzi text-lg font-bold text-ink">{item.char}</span>
			<span class="font-mono text-[11px] font-medium" style="color: {item.toneColor}">{item.pinyin}</span>
		</div>
	{/each}
</div>
