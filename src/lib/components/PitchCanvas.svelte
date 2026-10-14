<script lang="ts">
	import type { ContourPoint } from "#lib/audio/yin";
	import { t } from "#lib/i18n/index.svelte";

	interface Props {
		reference?: ContourPoint[] | undefined;
		user?: ContourPoint[] | undefined;
		highlightTones?: number[] | undefined;
	}

	let { reference = [], user = [], highlightTones = [] }: Props = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let container: HTMLDivElement | null = $state(null);

	const MIN_HZ = 70;
	const MAX_HZ = 500;
	const PADDING = 16;

	function cssVar(name: string, element: Element): string {
		return getComputedStyle(element).getPropertyValue(name).trim();
	}

	function frequencyToRatio(frequency: number): number {
		const clamped = Math.min(MAX_HZ, Math.max(MIN_HZ, frequency));
		const minLog = Math.log2(MIN_HZ);
		const maxLog = Math.log2(MAX_HZ);
		return (Math.log2(clamped) - minLog) / (maxLog - minLog);
	}

	function drawCurve(
		context: CanvasRenderingContext2D,
		contour: ContourPoint[],
		color: string,
		dashed: boolean,
		width: number,
		height: number,
		scale: number,
	): void {
		const voiced = contour.filter((point) => point.frequency > 0);
		if (voiced.length < 2) return;
		const start = voiced[0]?.timeMs ?? 0;
		const end = voiced[voiced.length - 1]?.timeMs ?? start;
		const span = Math.max(1, end - start);

		context.save();
		context.strokeStyle = color;
		context.lineWidth = 2 * scale;
		if (dashed) {
			context.setLineDash([6 * scale, 5 * scale]);
		}
		context.beginPath();
		let started = false;
		for (const point of contour) {
			if (point.frequency <= 0) {
				started = false;
				continue;
			}
			const x = PADDING + ((point.timeMs - start) / span) * (width - PADDING * 2);
			const y =
				height - PADDING - frequencyToRatio(point.frequency) * (height - PADDING * 2);
			if (started) {
				context.lineTo(x, y);
			} else {
				context.moveTo(x, y);
				started = true;
			}
		}
		context.stroke();
		context.restore();
	}

	function draw(): void {
		if (!canvas || !container) return;
		const context = canvas.getContext("2d");
		if (!context) return;

		const scale = window.devicePixelRatio || 1;
		const width = container.clientWidth;
		const height = container.clientHeight;
		if (width === 0 || height === 0) return;

		if (canvas.width !== width * scale || canvas.height !== height * scale) {
			canvas.width = width * scale;
			canvas.height = height * scale;
		}
		context.setTransform(scale, 0, 0, scale, 0, 0);
		context.clearRect(0, 0, width, height);

		const bandHeight = (height - PADDING * 2) / 4;
		for (let tone = 1; tone <= 4; tone++) {
			context.fillStyle = cssVar(`--color-tone-${tone}`, canvas);
			context.globalAlpha = highlightTones.includes(tone) ? 0.35 : 0.08;
			context.fillRect(PADDING, PADDING + (tone - 1) * bandHeight, width - PADDING * 2, bandHeight);
		}
		context.globalAlpha = 1;

		context.strokeStyle = cssVar("--color-ink-muted", canvas);
		context.setLineDash([4, 6]);
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(PADDING, height / 2);
		context.lineTo(width - PADDING, height / 2);
		context.stroke();
		context.setLineDash([]);

		drawCurve(context, reference, cssVar("--color-ink", canvas), true, width, height, scale);
		drawCurve(context, user, cssVar("--color-action", canvas), false, width, height, scale);
	}

	$effect(() => {
		void reference;
		void user;
		void highlightTones;
		draw();
	});

	$effect(() => {
		if (!container) return;
		const observer = new ResizeObserver(() => draw());
		observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="relative h-64 w-full md:h-72">
	<canvas bind:this={canvas} class="h-full w-full"></canvas>
	<span class="data-pill absolute top-2 left-2 px-2 py-0.5 text-xs">
		{t().toneLab.pitchAnchors.high}
	</span>
	<span class="data-pill absolute bottom-2 left-2 px-2 py-0.5 text-xs">
		{t().toneLab.pitchAnchors.low}
	</span>
</div>
