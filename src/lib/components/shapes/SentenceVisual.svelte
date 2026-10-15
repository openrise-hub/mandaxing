<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const bars = [
		{ x: 22, y: 26, width: 116, height: 13, color: "var(--color-tone-1, #F59E0B)" },
		{ x: 22, y: 49, width: 78, height: 13, color: "var(--color-tone-2, #EA580C)" },
		{ x: 22, y: 72, width: 116, height: 13, color: "var(--color-tone-2, #EA580C)" },
		{ x: 22, y: 95, width: 64, height: 13, color: "var(--color-tone-3, #DC2626)" },
		{ x: 22, y: 118, width: 98, height: 13, color: "var(--color-tone-4, #7F1D1D)" }
	];
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		{#each bars as bar}
			<rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.color} />
		{/each}
	</svg>
</div>
