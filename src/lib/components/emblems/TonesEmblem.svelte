<script lang="ts">
	import TonesVisual from "#lib/components/shapes/TonesVisual.svelte";

	interface Props {
		title?: string;
		subtitle?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		title = "Tones",
		subtitle = "Pitch and Pronunciation",
		onclick,
		class: className = ""
	}: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onclick?.();
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	{onclick}
	onkeydown={handleKeydown}
	class="mech-btn flex flex-col justify-between p-6 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-all group {className}"
	aria-label="{title}: {subtitle}"
>
	<div class="flex h-1.5 w-full mb-4 rounded-xs overflow-hidden">
		<div class="flex-1 bg-[var(--color-tone-1)]"></div>
		<div class="flex-1 bg-[var(--color-tone-2)]"></div>
		<div class="flex-1 bg-[var(--color-tone-3)]"></div>
		<div class="flex-1 bg-[var(--color-tone-4)]"></div>
	</div>

	<div class="w-full my-auto flex justify-center py-2">
		<TonesVisual class="w-full max-w-[280px]" />
	</div>

	<div class="mt-4 pt-3 border-t border-[var(--color-ink)]/15">
		<h2 class="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-action)] transition-colors">
			{title}
		</h2>
		<p class="font-sans text-xs font-medium text-[var(--color-ink-muted)] mt-1">
			{subtitle}
		</p>
	</div>
</div>
