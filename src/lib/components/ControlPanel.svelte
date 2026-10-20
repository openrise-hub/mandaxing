<script lang="ts">
	import type { ScoreResult } from "#lib/dsp/scoring";
	import { t } from "#lib/i18n/index.svelte";

	interface Props {
		busy: boolean;
		recording: boolean;
		canUse: boolean;
		unavailable: boolean;
		offline: boolean;
		onListen: () => void;
		onRecord: () => void;
		onStop: () => void;
		result?: ScoreResult | null | undefined;
	}

	let {
		busy,
		recording,
		canUse,
		unavailable,
		offline,
		onListen,
		onRecord,
		onStop,
		result = null,
	}: Props = $props();
</script>

<section class="mech-card flex flex-wrap items-center gap-3 p-4">
	<button
		type="button"
		class="mech-btn px-4 py-2 font-display font-bold disabled:opacity-40"
		disabled={!canUse || busy || recording}
		onclick={onListen}
	>
		{t().toneLab.playReference}
	</button>
	{#if recording}
		<button
			type="button"
			class="mech-btn bg-alert px-4 py-2 font-display font-bold text-card"
			onclick={onStop}
		>
			{t().toneLab.stopVoice}
		</button>
	{:else}
		<button
			type="button"
			class="mech-btn px-4 py-2 font-display font-bold disabled:opacity-40"
			disabled={!canUse || busy}
			onclick={onRecord}
		>
			{t().toneLab.recordVoice}
		</button>
	{/if}
	<div class="ml-auto flex items-center gap-2" role="status" aria-live="polite">
		{#if offline}
			<span class="data-pill px-2 py-1 text-xs">{t().common.offline}</span>
		{:else if unavailable}
			<span class="data-pill px-2 py-1 text-xs">{t().common.audioUnavailable}</span>
		{:else if busy}
			<span class="data-pill px-2 py-1 text-xs">{t().common.loading}</span>
		{:else if result}
			<span class="data-pill px-2 py-1 text-xs font-mono tabular-nums">
				{t().common.accuracy}: {result.score}%
			</span>
			<span
				class="data-pill px-2 py-1 text-xs text-card font-bold"
				class:bg-success={result.passed}
				class:bg-alert={!result.passed}
			>
				{result.passed ? t().common.valid : t().common.retry}
			</span>
		{/if}
	</div>
</section>
