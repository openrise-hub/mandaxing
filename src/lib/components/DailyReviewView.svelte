<script lang="ts">
	import { onMount } from "svelte";
	import { Rating, type Grade } from "ts-fsrs";
	import RatingControlBar from "#lib/components/RatingControlBar.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import SRSCard from "#lib/components/SRSCard.svelte";
	import { t } from "#lib/i18n/index.svelte";
	import { review } from "#lib/state/daily-review.svelte";

	const keyRatings: Record<string, Grade> = {
		Digit1: Rating.Again,
		Digit2: Rating.Hard,
		Digit3: Rating.Good,
		Digit4: Rating.Easy,
	};

	let current = $derived(review.current);
	let previews = $derived(review.previews);

	function handleKeydown(event: KeyboardEvent): void {
		if (event.target instanceof HTMLInputElement) return;
		if (event.code === "Space") {
			event.preventDefault();
			review.reveal();
			return;
		}
		const rating = keyRatings[event.code];
		if (rating !== undefined && review.revealed) {
			void review.grade(rating);
		}
	}

	onMount(() => {
		void review.init();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader title={t().srs.title} subtitle={t().srs.subtitle}>
		<span class="data-pill px-2.5 py-1 text-xs font-mono tabular-nums font-bold">
			{t().srs.dueCount}: {review.dueCount}
		</span>
	</SectionHeader>

	{#if review.status === "loading"}
		<p class="mech-card p-4 text-sm font-sans">{t().common.loading}</p>
	{:else if review.status === "offline"}
		<p class="mech-card p-4 text-sm font-sans">{t().common.offline}</p>
	{:else if current}
		<div class="mx-auto flex w-full max-w-xl flex-col gap-4">
			<SRSCard
				view={current}
				revealed={review.revealed}
				playing={review.playing}
				audioUnavailable={review.audioUnavailable}
				onReveal={() => review.reveal()}
				onPlayAudio={() => void review.playAudio()}
			/>
			{#if review.revealed}
				<RatingControlBar
					{previews}
					disabled={review.submitting}
					onGrade={(rating) => void review.grade(rating)}
				/>
			{/if}
			<p class="text-center text-xs text-ink-muted font-mono">{t().srs.shortcutsHint}</p>
		</div>
	{:else}
		<div class="mech-card p-6 text-center flex flex-col items-center gap-3 max-w-md mx-auto">
			<p class="text-sm text-ink-muted">{t().srs.emptyState}</p>
		</div>
	{/if}
</div>
