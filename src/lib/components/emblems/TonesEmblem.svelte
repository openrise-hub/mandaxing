<script lang="ts">
	import TonesVisual from "#lib/components/shapes/TonesVisual.svelte";

	interface Props {
		title?: string;
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
	class="retro-badge-card flex flex-col justify-between p-0 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform w-full max-w-[170px] mx-auto rounded-t-none rounded-b-[24px] overflow-hidden {className}"
	aria-label={title}
>
	<div class="w-full bg-card border-b-[1.5px] border-ink py-2 text-center">
		<span class="font-display text-sm md:text-base font-black text-ink tracking-tight block text-center uppercase">
			{title}
		</span>
	</div>

	<div class="w-full aspect-square bg-[var(--color-ink)] flex items-center justify-center p-3 sm:p-4 rounded-b-[22px] overflow-hidden">
		<TonesVisual class="w-full h-full" />
	</div>
</button>
