<script lang="ts">
	interface Props {
		pinyin: string;
		hanzi?: string | undefined;
		translation: string;
		tones: number[];
		label?: string | undefined;
	}

	let { pinyin, hanzi, translation, tones, label }: Props = $props();
</script>

<article class="mech-card flex flex-col gap-3 p-5">
	{#if label}
		<span class="data-pill self-start px-2 py-1 text-xs">{label}</span>
	{/if}
	<div class="flex items-center gap-1" aria-hidden="true">
		{#each [1, 2, 3, 4] as tone (tone)}
			<span
				class="h-2 w-8 rounded-[2px]"
				style="background-color: var(--color-tone-{tone}); opacity: {tones.includes(tone)
					? 1
					: 0.15}"
			></span>
		{/each}
		{#if tones.includes(0)}
			<span
				class="h-2 w-8 rounded-[2px]"
				style="background-color: var(--color-tone-neutral)"
			></span>
		{/if}
	</div>
	<p class="font-mono text-3xl font-medium">{pinyin}</p>
	{#if hanzi}
		<p class="hanzi text-5xl leading-none">{hanzi}</p>
	{/if}
	<p class="text-sm text-ink-muted">{translation}</p>
</article>
