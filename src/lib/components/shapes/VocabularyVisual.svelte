<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	// 6x6 dot matrix inspired by badge 18 in reference image
	const dots = [
		// row 0
		{ cx: 35, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 53, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 71, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 89, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 107, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 125, cy: 35, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		// row 1
		{ cx: 35, cy: 53, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		{ cx: 53, cy: 53, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 71, cy: 53, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 89, cy: 53, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 107, cy: 53, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 125, cy: 53, color: "var(--color-tone-1, #F59E0B)", r: 6 },
		// row 2
		{ cx: 35, cy: 71, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 53, cy: 71, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 71, cy: 71, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 89, cy: 71, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 107, cy: 71, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 125, cy: 71, color: "var(--color-tone-2, #EA580C)", r: 6 },
		// row 3
		{ cx: 35, cy: 89, color: "var(--color-tone-2, #EA580C)", r: 6 },
		{ cx: 53, cy: 89, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 71, cy: 89, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 89, cy: 89, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 107, cy: 89, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 125, cy: 89, color: "var(--color-tone-2, #EA580C)", r: 6 },
		// row 4
		{ cx: 35, cy: 107, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 53, cy: 107, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 71, cy: 107, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 89, cy: 107, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 107, cy: 107, color: "var(--color-tone-3, #DC2626)", r: 6 },
		{ cx: 125, cy: 107, color: "var(--color-tone-3, #DC2626)", r: 6 },
		// row 5
		{ cx: 35, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 53, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 71, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 89, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 107, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 },
		{ cx: 125, cy: 125, color: "var(--color-tone-4, #7F1D1D)", r: 6 }
	];
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Dot Matrix (Badge 18 style) -->
		{#each dots as dot}
			<circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} />
		{/each}
	</svg>
</div>
