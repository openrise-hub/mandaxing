<script lang="ts">
	import { onMount } from "svelte";
	import CharacterDecompositionCard from "#lib/components/CharacterDecompositionCard.svelte";
	import CompoundWordsList from "#lib/components/CompoundWordsList.svelte";
	import MizigeCanvas from "#lib/components/MizigeCanvas.svelte";
	import { t } from "#lib/i18n/index.svelte";
	import { studio } from "#lib/state/hanzi-studio.svelte";

	const hintKeys = {
		start: "strokeHintStart",
		end: "strokeHintEnd",
		deviation: "strokeHintDeviation",
	} as const;

	let current = $derived(studio.current);

	let rejectionHint = $derived(
		studio.rejectionReason === null
			? null
			: t().hanziStudio[hintKeys[studio.rejectionReason]],
	);

	onMount(() => {
		void studio.load();
	});
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-2xl font-bold">{t().hanziStudio.title}</h1>
		<p class="text-sm text-ink-muted">{t().hanziStudio.subtitle}</p>
	</div>

	<div class="grid items-start gap-4 lg:grid-cols-2">
		<div class="flex flex-col gap-3">
			{#if studio.status === "unavailable"}
				<p class="mech-card p-4 text-sm">{t().hanziStudio.unavailable}</p>
			{:else if studio.status === "offline"}
				<p class="mech-card p-4 text-sm">{t().common.offline}</p>
			{:else}
				<MizigeCanvas disabled={studio.status !== "idle"} />
			{/if}
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					class="mech-btn px-3 py-1.5 text-sm"
					onclick={() => studio.clear()}
				>
					{t().hanziStudio.clearCanvas}
				</button>
				<button
					type="button"
					class="mech-btn px-3 py-1.5 text-sm disabled:opacity-40"
					disabled={studio.playing || studio.audioUnavailable}
					onclick={() => void studio.playAudio()}
				>
					{t().common.playAudio}
				</button>
				<button
					type="button"
					class="mech-btn px-3 py-1.5 text-sm"
					onclick={() => void studio.select(-1)}
				>
					{t().common.previous}
				</button>
				<button
					type="button"
					class="mech-btn px-3 py-1.5 text-sm"
					onclick={() => void studio.select(1)}
				>
					{t().common.next}
				</button>
				<span class="data-pill px-2 py-1 text-xs">
					{t().hanziStudio.strokesLabel}
					{studio.completedStrokes}/{studio.totalStrokes}
				</span>
				{#if studio.status === "loading"}
					<span class="data-pill px-2 py-1 text-xs">{t().common.loading}</span>
				{/if}
				{#if studio.audioUnavailable}
					<span class="data-pill px-2 py-1 text-xs">
						{t().common.audioUnavailable}
					</span>
				{/if}
				{#if studio.mastered}
					<span class="data-pill bg-success px-2 py-1 text-xs text-card">
						{t().hanziStudio.mastered}
					</span>
				{/if}
				{#if studio.feedback === "accepted"}
					<span class="data-pill bg-success px-2 py-1 text-xs text-card">
						{t().common.valid}
					</span>
				{:else if studio.feedback === "rejected" && rejectionHint}
					<span class="data-pill bg-alert px-2 py-1 text-xs text-card">
						{rejectionHint}
					</span>
				{/if}
			</div>
		</div>
		<div class="flex flex-col gap-4">
			{#if current}
				<CharacterDecompositionCard
					character={current.character}
					breakdown={current.breakdown}
					source={current.source}
				/>
			{/if}
			{#if studio.compoundWords.length > 0}
				<CompoundWordsList items={studio.compoundWords} />
			{/if}
		</div>
	</div>
</section>
