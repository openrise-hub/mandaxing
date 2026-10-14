<script lang="ts">
	import { i18n, t } from "#lib/i18n/index.svelte";
	import type { ReviewCardView } from "#lib/state/daily-review.svelte";

	interface Props {
		view: ReviewCardView;
		revealed: boolean;
		playing: boolean;
		audioUnavailable: boolean;
		onReveal: () => void;
		onPlayAudio: () => void;
	}

	let {
		view,
		revealed,
		playing,
		audioUnavailable,
		onReveal,
		onPlayAudio,
	}: Props = $props();

	let translation = $derived(i18n.locale === "es" ? view.es : view.en);

	let radicalMeaning = $derived(
		view.breakdown === null
			? null
			: i18n.locale === "es"
				? view.breakdown.radicalMeaning.es
				: view.breakdown.radicalMeaning.en,
	);
</script>

<article class="mech-card flex flex-col gap-4 p-6">
	<p class="hanzi text-center text-7xl leading-none">{view.characters}</p>
	{#if revealed}
		<div class="flex flex-col gap-3 border-ink border-t-[1.5px] pt-4">
			{#if view.pinyin}
				<p class="text-center font-mono text-2xl">{view.pinyin}</p>
			{/if}
			{#if translation}
				<p class="text-center text-sm text-ink-muted">{translation}</p>
			{/if}
			{#if view.breakdown}
				<div class="flex flex-wrap items-center justify-center gap-4 text-sm">
					<span class="flex items-center gap-2">
						<span class="font-display text-xs font-bold uppercase">
							{t().hanziStudio.radicalLabel}
						</span>
						<span class="hanzi text-xl leading-none">{view.breakdown.radical}</span>
						<span class="text-ink-muted">{radicalMeaning}</span>
					</span>
					{#if view.breakdown.phonetic}
						<span class="flex items-center gap-2">
							<span class="font-display text-xs font-bold uppercase">
								{t().hanziStudio.phoneticLabel}
							</span>
							<span class="hanzi text-xl leading-none">{view.breakdown.phonetic}</span>
							{#if view.breakdown.phoneticHint}
								<span class="font-mono text-ink-muted">
									{view.breakdown.phoneticHint}
								</span>
							{/if}
						</span>
					{/if}
				</div>
			{/if}
			<div class="flex flex-wrap items-center justify-center gap-2">
				{#if view.syllables.length > 0}
					<button
						type="button"
						class="mech-btn px-3 py-1.5 text-sm disabled:opacity-40"
						disabled={playing || audioUnavailable}
						onclick={onPlayAudio}
					>
						{t().common.playAudio}
					</button>
				{/if}
				{#if audioUnavailable}
					<span class="data-pill px-2 py-1 text-xs">
						{t().common.audioUnavailable}
					</span>
				{/if}
			</div>
		</div>
	{:else}
		<button
			type="button"
			class="mech-btn self-center px-5 py-2 font-display font-bold"
			onclick={onReveal}
		>
			{t().srs.revealAnswer}
		</button>
	{/if}
</article>
