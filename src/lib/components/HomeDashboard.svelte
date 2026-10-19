<script lang="ts">
	import { onMount } from "svelte";
	import HanziEmblem from "#lib/components/emblems/HanziEmblem.svelte";
	import ReaderEmblem from "#lib/components/emblems/ReaderEmblem.svelte";
	import ReviewEmblem from "#lib/components/emblems/ReviewEmblem.svelte";
	import SentencesEmblem from "#lib/components/emblems/SentencesEmblem.svelte";
	import TonesEmblem from "#lib/components/emblems/TonesEmblem.svelte";
	import VocabularyEmblem from "#lib/components/emblems/VocabularyEmblem.svelte";
	import MizigeVisual from "#lib/components/shapes/MizigeVisual.svelte";
	import PerspectiveStripes from "#lib/components/shapes/PerspectiveStripes.svelte";
	import ReaderVisual from "#lib/components/shapes/ReaderVisual.svelte";
	import ReviewVisual from "#lib/components/shapes/ReviewVisual.svelte";
	import SentenceVisual from "#lib/components/shapes/SentenceVisual.svelte";
	import TonesVisual from "#lib/components/shapes/TonesVisual.svelte";
	import VocabularyVisual from "#lib/components/shapes/VocabularyVisual.svelte";
	import { t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { review } from "#lib/state/daily-review.svelte";

	onMount(() => {
		void review.init();
	});

	let mobileCards = $derived([
		{
			key: "review",
			title: t().dashboard.reviewTitle,
			subtitle: t().dashboard.reviewSubtitle,
			visual: ReviewVisual,
			action: () => appView.set("review"),
			badge: review.dueCount > 0 ? `${review.dueCount} ${t().dashboard.dueBadge}` : null,
		},
		{
			key: "tones",
			title: t().dashboard.tonesTitle,
			subtitle: t().dashboard.tonesSubtitle,
			visual: TonesVisual,
			action: () => appView.set("lab"),
			badge: null,
		},
		{
			key: "hanzi",
			title: t().dashboard.hanziTitle,
			subtitle: t().dashboard.hanziSubtitle,
			visual: MizigeVisual,
			action: () => appView.set("studio"),
			badge: null,
		},
		{
			key: "sentences",
			title: t().dashboard.sentencesTitle,
			subtitle: t().dashboard.sentencesSubtitle,
			visual: SentenceVisual,
			action: () => appView.set("sentences"),
			badge: null,
		},
		{
			key: "vocabulary",
			title: t().dashboard.vocabularyTitle,
			subtitle: t().dashboard.vocabularySubtitle,
			visual: VocabularyVisual,
			action: () => appView.set("matrix"),
			badge: null,
		},
		{
			key: "reader",
			title: t().dashboard.readerTitle,
			subtitle: t().dashboard.readerSubtitle,
			visual: ReaderVisual,
			action: () => appView.set("reader"),
			badge: null,
		},
	]);
</script>

<!-- Mobile phone view: Clean vertical list of tactile rectangular cards with icon on left and text on right -->
<div class="w-full flex flex-col gap-3 md:hidden py-2">
	{#each mobileCards as card (card.key)}
		<button
			type="button"
			onclick={card.action}
			class="mech-btn w-full flex items-center p-0 text-left cursor-pointer overflow-hidden group"
			aria-label={card.title}
		>
			<div class="w-14 h-14 bg-ink border-r-[1.5px] border-ink flex items-center justify-center p-2.5 flex-shrink-0">
				<card.visual class="w-full h-full" />
			</div>
			<div class="flex-1 min-w-0 px-3.5 py-2">
				<h2 class="font-display font-bold text-sm text-ink tracking-tight truncate">
					{card.title}
				</h2>
				<p class="font-sans text-xs text-ink-muted truncate">
					{card.subtitle}
				</p>
			</div>
			<div class="pr-3 pl-1 flex items-center gap-1.5 flex-shrink-0">
				{#if card.badge}
					<span class="data-pill px-2 py-0.5 text-xs text-card bg-tone-2 font-bold">
						{card.badge}
					</span>
				{/if}
				<span class="text-ink font-bold text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
					&rarr;
				</span>
			</div>
		</button>
	{/each}
</div>

<!-- PC / Desktop view: Retro perspective background with Daily Review on top and 5 modules at bottom -->
<div class="hidden md:flex fixed inset-0 pointer-events-none -z-10 overflow-hidden items-center justify-center select-none">
	<PerspectiveStripes class="w-full h-full min-w-full min-h-full opacity-70" />
</div>

<div class="hidden md:flex w-full max-w-6xl mx-auto px-4 min-h-[calc(100dvh-140px)] flex-col justify-between items-center py-2 md:py-6">
	<div class="w-full flex justify-center pt-1 sm:pt-3">
		<div class="w-full max-w-[170px] sm:max-w-[185px]">
			<ReviewEmblem
				title={t().dashboard.reviewTitle}
				onclick={() => appView.set("review")}
			/>
		</div>
	</div>

	<div class="w-full max-w-5xl grid grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 justify-items-center items-stretch pb-2 md:pb-6">
		<div class="w-full max-w-[170px]">
			<TonesEmblem
				title={t().dashboard.tonesTitle}
				onclick={() => appView.set("lab")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<HanziEmblem
				title={t().dashboard.hanziTitle}
				onclick={() => appView.set("studio")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<SentencesEmblem
				title={t().dashboard.sentencesTitle}
				onclick={() => appView.set("sentences")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<VocabularyEmblem
				title={t().dashboard.vocabularyTitle}
				onclick={() => appView.set("matrix")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<ReaderEmblem
				title={t().dashboard.readerTitle}
				onclick={() => appView.set("reader")}
			/>
		</div>
	</div>
</div>
