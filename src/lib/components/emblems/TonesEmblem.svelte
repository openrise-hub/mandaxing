<script lang="ts">
	import TonesVisual from "#lib/components/shapes/TonesVisual.svelte";

	interface Props {
		title?: string;
		badgeNumber?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		title = "Tones",
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

<button
	type="button"
	{onclick}
	onkeydown={handleKeydown}
	class="retro-badge-card flex flex-col justify-between p-2.5 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform w-full max-w-[190px] mx-auto {className}"
	aria-label={title}
>
	<div class="w-full aspect-square bg-[var(--color-ink)] flex items-center justify-center p-3 overflow-hidden">
		<TonesVisual class="w-full h-full" />
	</div>

	<div class="w-full pt-2 pb-0.5 text-center">
		<span class="font-display text-sm md:text-base font-black text-[var(--color-ink)] tracking-tight block text-center">
			{title}
		</span>
	</div>
</button>
