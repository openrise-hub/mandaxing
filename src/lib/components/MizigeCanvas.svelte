<script lang="ts">
	import { studio } from "#lib/state/hanzi-studio.svelte";
	import type { VectorPoint } from "#lib/vector/stroke-evaluator";

	interface Props {
		disabled?: boolean | undefined;
	}

	let { disabled = false }: Props = $props();

	const VIEW_SIZE = 1024;

	let svg: SVGSVGElement | null = $state(null);
	let tracing = $state(false);
	let trail = $state<VectorPoint[]>([]);

	function toLocalPoint(event: PointerEvent): VectorPoint {
		const element = svg;
		if (!element) return { x: 0, y: 0 };
		const rect = element.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
		return {
			x: ((event.clientX - rect.left) / rect.width) * VIEW_SIZE,
			y: ((event.clientY - rect.top) / rect.height) * VIEW_SIZE,
		};
	}

	function startTrace(event: PointerEvent): void {
		if (disabled || !studio.strokeData) return;
		svg?.setPointerCapture(event.pointerId);
		tracing = true;
		trail = [toLocalPoint(event)];
	}

	function extendTrace(event: PointerEvent): void {
		if (!tracing) return;
		trail = [...trail, toLocalPoint(event)];
	}

	function endTrace(event: PointerEvent): void {
		if (!tracing) return;
		const points = [...trail, toLocalPoint(event)];
		tracing = false;
		trail = [];
		if (points.length >= 2) {
			studio.submitStroke(points);
		}
	}

	function cancelTrace(): void {
		tracing = false;
		trail = [];
	}
</script>

<div
	class="mech-card relative aspect-square w-full overflow-hidden bg-card"
	class:border-alert={studio.feedback === "rejected"}
>
	<svg
		bind:this={svg}
		viewBox="0 0 {VIEW_SIZE} {VIEW_SIZE}"
		class="h-full w-full touch-none select-none"
		class:cursor-crosshair={!disabled}
		class:cursor-not-allowed={disabled}
		role="img"
		aria-label={studio.current?.character ?? ""}
		onpointerdown={startTrace}
		onpointermove={extendTrace}
		onpointerup={endTrace}
		onpointercancel={cancelTrace}
	>
		<rect
			x="8"
			y="8"
			width="1008"
			height="1008"
			fill="none"
			class="stroke-ink-muted"
			stroke-width="2"
		/>
		<g class="stroke-ink-muted" stroke-width="2" stroke-dasharray="12 12">
			<line x1="512" y1="8" x2="512" y2="1016" />
			<line x1="8" y1="512" x2="1016" y2="512" />
			<line x1="8" y1="8" x2="1016" y2="1016" />
			<line x1="1016" y1="8" x2="8" y2="1016" />
		</g>
		{#each studio.strokeData?.strokes ?? [] as path, index (index)}
			<path
				d={path}
				class="fill-ink"
				opacity={index < studio.completedStrokes ? 1 : 0.12}
			/>
		{/each}
		{#if trail.length > 1}
			<polyline
				points={trail.map((point) => `${point.x},${point.y}`).join(" ")}
				fill="none"
				class="stroke-action"
				stroke-width="10"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
	</svg>
</div>
