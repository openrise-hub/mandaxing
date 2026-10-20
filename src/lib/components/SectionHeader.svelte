<script lang="ts">
	import type { Snippet } from "svelte";
	import { t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";

	interface Props {
		title: string;
		subtitle: string;
		backLabel?: string;
		onBack?: () => void;
		children?: Snippet;
	}

	let {
		title,
		subtitle,
		backLabel,
		onBack = () => appView.set("dashboard"),
		children,
	}: Props = $props();

	let label = $derived(backLabel ?? t().common.backToDashboard);
</script>

<div class="flex flex-col gap-3 border-b-2 border-ink/15 pb-4">
	<div class="flex items-center justify-between gap-3">
		<button
			type="button"
			onclick={onBack}
			class="mech-btn px-3 py-1.5 font-display text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
			aria-label={label}
		>
			<span aria-hidden="true">&larr;</span>
			<span>{label}</span>
		</button>

		{#if children}
			<div class="flex flex-wrap items-center gap-2">
				{@render children()}
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-1.5 pt-1">
		<div class="flex h-1.5 w-24 rounded-xs overflow-hidden select-none" aria-hidden="true">
			<div class="flex-1 bg-tone-1"></div>
			<div class="flex-1 bg-tone-2"></div>
			<div class="flex-1 bg-tone-3"></div>
			<div class="flex-1 bg-tone-4"></div>
		</div>
		<h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink text-pretty">
			{title}
		</h1>
		<p class="font-sans text-xs md:text-sm text-ink-muted">
			{subtitle}
		</p>
	</div>
</div>
