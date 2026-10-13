<script lang="ts">
	import { t } from "#lib/i18n/index.svelte";
	import type { WordBankItem } from "#lib/types/catalogs";

	interface Props {
		items: WordBankItem[];
		onSelect: (item: WordBankItem) => void;
	}

	let { items, onSelect }: Props = $props();

	const GREETING_IDS = new Set(["wb1_nihao", "wb1_xiexie", "wb1_bukeqi", "wb1_zaijian"]);

	const groups = $derived([
		{ key: "pronouns", items: items.filter((item) => !GREETING_IDS.has(item.id)) },
		{ key: "greetings", items: items.filter((item) => GREETING_IDS.has(item.id)) },
	] as const);
</script>

<section class="mech-card flex flex-col gap-4 p-4">
	<h2 class="font-display text-sm font-bold tracking-wide uppercase">{t().wordBank.title}</h2>
	{#each groups as group (group.key)}
		<div class="flex flex-col gap-2">
			<h3 class="font-mono text-xs text-ink-muted uppercase">{t().wordBank[group.key]}</h3>
			<div class="flex flex-wrap gap-2">
				{#each group.items as item (item.id)}
					<button
						type="button"
						class="mech-btn flex items-baseline gap-2 px-3 py-1.5"
						onclick={() => onSelect(item)}
					>
						<span class="hanzi text-lg">{item.characters}</span>
						<span class="font-mono text-xs">{item.pinyin}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</section>
