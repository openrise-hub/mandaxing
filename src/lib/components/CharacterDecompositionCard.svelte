<script lang="ts">
	import { i18n, t } from "#lib/i18n/index.svelte";
	import type { ComponentBreakdown, WordBankEntry } from "#lib/types/catalogs";

	interface Props {
		character: string;
		breakdown: ComponentBreakdown;
		source: WordBankEntry;
	}

	let { character, breakdown, source }: Props = $props();

	let radicalMeaning = $derived(
		i18n.locale === "es" ? breakdown.radicalMeaning.es : breakdown.radicalMeaning.en,
	);
</script>

<article class="mech-card flex flex-col gap-4 p-5">
	<div class="flex items-end justify-between gap-3">
		<p class="hanzi text-6xl leading-none">{character}</p>
		<span class="data-pill px-2 py-1 font-mono text-xs">
			{source.characters} · {source.pinyin}
		</span>
	</div>
	<dl class="flex flex-col gap-3 text-sm">
		<div class="flex items-center gap-3">
			<dt class="w-40 font-display text-xs font-bold uppercase">
				{t().hanziStudio.radicalLabel}
			</dt>
			<dd class="flex items-center gap-2">
				<span class="hanzi text-2xl leading-none">{breakdown.radical}</span>
				<span class="text-ink-muted">{radicalMeaning}</span>
			</dd>
		</div>
		<div class="flex items-center gap-3">
			<dt class="w-40 font-display text-xs font-bold uppercase">
				{t().hanziStudio.phoneticLabel}
			</dt>
			{#if breakdown.phonetic}
				<dd class="flex items-center gap-2">
					<span class="hanzi text-2xl leading-none">{breakdown.phonetic}</span>
					{#if breakdown.phoneticHint}
						<span class="font-mono text-ink-muted">{breakdown.phoneticHint}</span>
					{/if}
				</dd>
			{:else}
				<dd class="text-ink-muted">{t().hanziStudio.noPhonetic}</dd>
			{/if}
		</div>
	</dl>
</article>
