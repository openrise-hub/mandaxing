<script lang="ts">
	import MizigeVisual from "#lib/components/shapes/MizigeVisual.svelte";

	interface Props {
		title?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		title = "Hanzi",
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
	class="retro-badge-card flex flex-col justify-between p-0 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform w-full max-w-[170px] mx-auto rounded-none overflow-hidden {className}"
	aria-label={title}
>
	<div class="w-full aspect-square bg-[var(--color-ink)] border-b-[1.5px] border-ink flex items-center justify-center p-3 sm:p-4 overflow-hidden">
		<MizigeVisual class="w-full h-full" />
	</div>

	<div class="w-full bg-card py-2 text-center">
		<span class="font-display text-sm md:text-base font-black text-ink tracking-tight block text-center uppercase">
			{title}
		</span>
	</div>
</button>
