<script lang="ts">
	import { onMount } from "svelte";
	import CharacterDecompositionCard from "#lib/components/CharacterDecompositionCard.svelte";
	import CompoundWordsList from "#lib/components/CompoundWordsList.svelte";
	import MizigeCanvas from "#lib/components/MizigeCanvas.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
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

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={t().hanziStudio.title}
		subtitle={t().hanziStudio.subtitle}
	>
		<span class="data-pill px-2.5 py-1 text-xs font-mono tabular-nums font-bold">
			{t().hanziStudio.strokesLabel} {studio.completedStrokes}/{studio.totalStrokes}
		</span>
	</SectionHeader>

	<div class="grid items-start gap-6 lg:grid-cols-2">
		<div class="flex flex-col gap-4">
			{#if studio.status === "unavailable"}
				<p class="mech-card p-4 text-sm">{t().hanziStudio.unavailable}</p>
			{:else if studio.status === "offline"}
				<p class="mech-card p-4 text-sm">{t().common.offline}</p>
			{:else}
				<MizigeCanvas disabled={studio.status !== "idle"} />
			{/if}
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex flex-wrap items-center gap-2">
					<button
						type="button"
						class="mech-btn px-3 py-1.5 text-sm font-display font-bold cursor-pointer"
						onclick={() => studio.clear()}
					>
						{t().hanziStudio.clearCanvas}
					</button>
					<button
						type="button"
						class="mech-btn px-3 py-1.5 text-sm font-display font-bold disabled:opacity-40 cursor-pointer"
						disabled={studio.playing || studio.audioUnavailable}
						onclick={() => void studio.playAudio()}
					>
						{t().common.playAudio}
					</button>
				</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="mech-btn px-3 py-1.5 text-sm font-display font-bold cursor-pointer"
						onclick={() => void studio.select(-1)}
					>
						{t().common.previous}
					</button>
					<button
						type="button"
						class="mech-btn px-3 py-1.5 text-sm font-display font-bold cursor-pointer"
						onclick={() => void studio.select(1)}
					>
						{t().common.next}
					</button>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2" role="status" aria-live="polite">
				{#if studio.status === "loading"}
					<span class="data-pill px-2 py-1 text-xs">{t().common.loading}</span>
				{/if}
				{#if studio.audioUnavailable}
					<span class="data-pill px-2 py-1 text-xs">
						{t().common.audioUnavailable}
					</span>
				{/if}
				{#if studio.mastered}
					<span class="data-pill bg-success px-2 py-1 text-xs text-card font-bold">
						{t().hanziStudio.mastered}
					</span>
				{/if}
				{#if studio.feedback === "accepted"}
					<span class="data-pill bg-success px-2 py-1 text-xs text-card font-bold">
						{t().common.valid}
					</span>
				{:else if studio.feedback === "rejected" && rejectionHint}
					<span class="data-pill bg-alert px-2 py-1 text-xs text-card font-bold">
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
</div>
