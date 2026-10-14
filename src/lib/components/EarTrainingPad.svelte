<script lang="ts">
	import { t } from "#lib/i18n/index.svelte";

	interface Props {
		disabled?: boolean | undefined;
		onSelect: (tone: number) => void;
	}

	let { disabled = false, onSelect }: Props = $props();

	const tones = [1, 2, 3, 4] as const;
	const toneKeys = ["tone1", "tone2", "tone3", "tone4"] as const;
</script>

<section class="grid gap-2">
	<h2 class="font-display text-sm font-bold tracking-wide uppercase">
		{t().toneLab.listeningPadTitle}
	</h2>
	<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
		{#each tones as tone, index (tone)}
			{@const toneKey = toneKeys[index] ?? "tone1"}
			<button
				type="button"
				class="mech-btn flex flex-col items-start gap-1 px-3 py-3 text-left disabled:opacity-40"
				style="border-bottom: 4px solid var(--color-tone-{tone})"
				{disabled}
				onclick={() => onSelect(tone)}
			>
				<span class="font-display text-sm font-bold">{t().toneLab.tones[toneKey].name}</span>
				<span class="font-mono text-xs text-ink-muted">
					{t().toneLab.tones[toneKey].description}
				</span>
			</button>
		{/each}
	</div>
</section>
