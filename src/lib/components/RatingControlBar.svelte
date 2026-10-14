<script lang="ts">
	import { Rating, type Grade } from "ts-fsrs";
	import { t } from "#lib/i18n/index.svelte";
	import type { RatingPreview } from "#lib/srs/scheduler";

	interface Props {
		previews: RatingPreview[];
		disabled?: boolean | undefined;
		onGrade: (rating: Grade) => void;
	}

	let { previews, disabled = false, onGrade }: Props = $props();

	const labels: Record<Grade, "again" | "hard" | "good" | "easy"> = {
		[Rating.Again]: "again",
		[Rating.Hard]: "hard",
		[Rating.Good]: "good",
		[Rating.Easy]: "easy",
	};

	const colors: Record<Grade, string> = {
		[Rating.Again]: "bg-alert",
		[Rating.Hard]: "bg-tone-2",
		[Rating.Good]: "bg-action",
		[Rating.Easy]: "bg-success",
	};

	function formatInterval(minutes: number): string {
		if (minutes < 1) return t().srs.lessThanAMinute;
		if (minutes < 60) return `${minutes} ${t().srs.minutesUnit}`;
		const days = Math.round(minutes / 1440);
		return `${days} ${t().srs.daysUnit}`;
	}
</script>

<section class="grid grid-cols-2 gap-2 md:grid-cols-4">
	{#each previews as preview (preview.rating)}
		<button
			type="button"
			class="mech-btn flex flex-col items-center gap-1 px-3 py-3 text-card disabled:opacity-40 {colors[
				preview.rating
			]}"
			disabled={disabled}
			onclick={() => onGrade(preview.rating)}
		>
			<span class="font-display text-sm font-bold">
				{t().srs.ratings[labels[preview.rating]]}
			</span>
			<span class="font-mono text-xs">{formatInterval(preview.intervalMinutes)}</span>
		</button>
	{/each}
</section>
