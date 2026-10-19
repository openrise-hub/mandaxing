<script lang="ts">
	interface Props {
		class?: string;
		horizonY?: number;
		topWidth?: number;
		bottomWidth?: number;
	}

	let {
		class: className = "",
		horizonY = 530,
		topWidth = 130,
		bottomWidth = 880,
	}: Props = $props();

	const stripeColors = [
		"var(--color-tone-4, #7F1D1D)",
		"var(--color-tone-neutral, #8C827A)",
		"var(--color-tone-1, #F59E0B)",
		"var(--color-tone-2, #EA580C)",
		"var(--color-tone-3, #DC2626)",
	];

	let topStartX = $derived(500 - topWidth / 2);

	let stripes = $derived.by(() => {
		const count = stripeColors.length;
		const topStripeWidth = topWidth / count;
		const bottomStripeWidth = bottomWidth / count;
		const startXTop = 500 - topWidth / 2;
		const startXBottom = 500 - bottomWidth / 2;

		return stripeColors.map((color, i) => {
			const topX1 = startXTop + i * topStripeWidth;
			const topX2 = topX1 + topStripeWidth;
			const bottomX1 = startXBottom + i * bottomStripeWidth;
			const bottomX2 = bottomX1 + bottomStripeWidth;

			return {
				color,
				rectX: topX1,
				rectWidth: topStripeWidth + 0.2,
				polygonPoints: `${topX1},${horizonY} ${topX2 + 0.2},${horizonY} ${bottomX2 + 0.2},1000 ${bottomX1},1000`,
			};
		});
	});
</script>

<div class="relative w-full h-full pointer-events-none select-none {className}" aria-hidden="true">
	<svg
		viewBox="0 0 1000 1000"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="w-full h-full"
		preserveAspectRatio="none"
		shape-rendering="geometricPrecision"
	>
		<defs>
			<filter id="perspective-ink-shadow" x="-10%" y="-10%" width="120%" height="120%">
				<feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#1E1B18" flood-opacity="0.12" />
			</filter>
		</defs>

		<g filter="url(#perspective-ink-shadow)">
			{#each stripes as s}
				<rect
					x={s.rectX}
					y="0"
					width={s.rectWidth}
					height={horizonY + 0.5}
					fill={s.color}
				/>
			{/each}

			{#each stripes as s}
				<polygon
					points={s.polygonPoints}
					fill={s.color}
				/>
			{/each}
		</g>

		<line
			x1={topStartX}
			y1={horizonY}
			x2={topStartX + topWidth}
			y2={horizonY}
			stroke="#1E1B18"
			stroke-width="1.5"
			stroke-opacity="0.25"
		/>
	</svg>
</div>
