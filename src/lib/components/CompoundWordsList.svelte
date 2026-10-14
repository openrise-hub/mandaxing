<script lang="ts">
	import { i18n, t } from "#lib/i18n/index.svelte";
	import type { WordBankEntry } from "#lib/types/catalogs";

	interface Props {
		items: WordBankEntry[];
	}

	let { items }: Props = $props();
</script>

<section class="mech-card flex flex-col gap-3 p-4">
	<h2 class="font-display text-sm font-bold uppercase tracking-wide">
		{t().hanziStudio.compoundWords}
	</h2>
	<ul class="flex flex-wrap gap-2">
		{#each items as item (item.id)}
			<li class="data-pill flex items-baseline gap-2 px-3 py-1.5">
				<span class="hanzi text-lg">{item.characters}</span>
				<span class="font-mono text-xs">{item.pinyin}</span>
				<span class="text-xs text-ink-muted">
					{i18n.locale === "es" ? item.es : item.en}
				</span>
			</li>
		{/each}
	</ul>
</section>
