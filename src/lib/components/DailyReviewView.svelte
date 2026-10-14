<script lang="ts">
	import { onMount } from "svelte";
	import { Rating, type Grade } from "ts-fsrs";
	import BackupControls from "#lib/components/BackupControls.svelte";
	import RatingControlBar from "#lib/components/RatingControlBar.svelte";
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

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-end justify-between gap-2">
		<div class="flex flex-col gap-1">
			<div class="flex h-1.5 w-24 mb-1 rounded-xs overflow-hidden">
				<div class="flex-1 bg-[var(--color-tone-1)]"></div>
				<div class="flex-1 bg-[var(--color-tone-2)]"></div>
				<div class="flex-1 bg-[var(--color-tone-3)]"></div>
				<div class="flex-1 bg-[var(--color-tone-4)]"></div>
			</div>
			<h1 class="font-display text-2xl font-bold">{t().srs.title}</h1>
			<p class="text-sm text-ink-muted">{t().srs.subtitle}</p>
		</div>
		<span class="data-pill px-2 py-1 text-xs">
			{t().srs.dueCount}: {review.dueCount}
		</span>
	</div>

	{#if review.status === "loading"}
		<p class="mech-card p-4 text-sm">{t().common.loading}</p>
	{:else if review.status === "offline"}
		<p class="mech-card p-4 text-sm">{t().common.offline}</p>
	{:else if current}
		<div class="mx-auto flex w-full max-w-xl flex-col gap-3">
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
			<p class="text-center text-xs text-ink-muted">{t().srs.shortcutsHint}</p>
		</div>
	{:else}
		<p class="mech-card p-4 text-sm">{t().srs.emptyState}</p>
	{/if}

	<BackupControls />
</section>
