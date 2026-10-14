<script lang="ts">
	import SentenceVisual from "#lib/components/shapes/SentenceVisual.svelte";

	interface Props {
		title?: string;
		badgeNumber?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		title = "Sentences",
		badgeNumber = "3/4",
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
	<!-- Dark graphic container matching reference image -->
	<div class="w-full aspect-square bg-[var(--color-ink)] rounded-md flex items-center justify-center p-3 overflow-hidden">
		<SentenceVisual class="w-full h-full" />
	</div>

	<!-- Bottom Card Strip: Fraction on Left, Title on Right -->
	<div class="w-full flex items-baseline justify-between pt-2 pb-0.5 px-1">
		<span class="font-mono text-xs font-bold text-[var(--color-ink-muted)]">
			{badgeNumber}
		</span>
		<span class="font-display text-sm md:text-base font-extrabold text-[var(--color-ink)] tracking-tight">
			{title}
		</span>
	</div>
</button>
