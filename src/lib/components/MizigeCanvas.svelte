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

	let activeGuide = $derived.by(() => {
		if (disabled || tracing || !studio.strokeData) return null;
		const medians = studio.strokeData.medians;
		const strokeIdx = studio.completedStrokes;
		if (strokeIdx >= medians.length) return null;
		const median = medians[strokeIdx];
		if (!median || median.length < 2) return null;
		const p0 = median[0];
		const p1 = median[1];
		if (!p0 || !p1) return null;
		const x0 = p0[0];
		const y0 = p0[1];
		const x1 = p1[0];
		const y1 = p1[1];
		if (
			typeof x0 !== "number" ||
			typeof y0 !== "number" ||
			typeof x1 !== "number" ||
			typeof y1 !== "number"
		) {
			return null;
		}

		const angle = Math.atan2(y1 - y0, x1 - x0);
		const dist = Math.hypot(x1 - x0, y1 - y0);
		const arrowLen = Math.max(50, Math.min(100, dist * 0.8));
		const tipX = x0 + Math.cos(angle) * arrowLen;
		const tipY = y0 + Math.sin(angle) * arrowLen;
		const headLen = 22;
		const headAngle = Math.PI / 6;
		const wing1X = tipX - headLen * Math.cos(angle - headAngle);
		const wing1Y = tipY - headLen * Math.sin(angle - headAngle);
		const wing2X = tipX - headLen * Math.cos(angle + headAngle);
		const wing2Y = tipY - headLen * Math.sin(angle + headAngle);

		return {
			x0,
			y0,
			tipX,
			tipY,
			headPoints: `${tipX.toFixed(1)},${tipY.toFixed(1)} ${wing1X.toFixed(1)},${wing1Y.toFixed(1)} ${wing2X.toFixed(1)},${wing2Y.toFixed(1)}`,
		};
	});
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
		{#if activeGuide}
			<g class="pointer-events-none select-none">
				<line
					x1={activeGuide.x0}
					y1={activeGuide.y0}
					x2={activeGuide.tipX}
					y2={activeGuide.tipY}
					class="stroke-action"
					stroke-width="8"
					stroke-linecap="round"
				/>
				<polygon
					points={activeGuide.headPoints}
					class="fill-action"
				/>
				<circle
					cx={activeGuide.x0}
					cy={activeGuide.y0}
					r="16"
					class="fill-action stroke-card"
					stroke-width="4"
				/>
			</g>
		{/if}
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
