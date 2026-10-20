<script lang="ts">
	import type { Snippet } from "svelte";
	import SerpentineRibbon from "#lib/components/shapes/SerpentineRibbon.svelte";

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = "", children }: Props = $props();
</script>

<div class="relative w-full min-h-full {className}">
	<div class="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none opacity-40">
		<SerpentineRibbon class="w-full h-full min-w-full min-h-full" />
	</div>
	{#if children}
		{@render children()}
	{/if}
</div>
