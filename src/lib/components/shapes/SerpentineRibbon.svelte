<script lang="ts">
	interface Props {
		class?: string;
		twoLoops?: boolean;
	}

	let { class: className = "", twoLoops = false }: Props = $props();

	let innerWidth = $state(1440);
	let innerHeight = $state(900);

	const toneColors = [
		"var(--color-tone-1, #F59E0B)",
		"var(--color-tone-2, #EA580C)",
		"var(--color-tone-3, #DC2626)",
		"var(--color-tone-4, #7F1D1D)",
	];

	const baseStrokeWidth = 32;
	const headerOffset = 65;

	let containerWidth = $derived(Math.max(innerWidth || 1440, 400));
	let containerHeight = $derived(Math.max((innerHeight || 900) - headerOffset, 400));

	let stripeData = $derived.by(() => {
		const W = containerWidth;
		const H = containerHeight;
		const S = Math.max(0.65, Math.min(1.2, H / 850));
		const sw = Math.round(baseStrokeWidth * S);

		const rb1 = 55 * S;
		const rb2 = 65 * S;

		const d1 = 2 * rb1 + 3 * sw;
		const d2 = 2 * rb2 + 3 * sw;
		const ribbonHeight = d1 + d2 + 4 * sw;

		// Vertically center within the open area below the header
		const yStart = Math.max(20, (H - ribbonHeight) / 2);

		const xr1 = Math.max(W - Math.min(200, W * 0.12), W * 0.82);
		const xl1 = Math.min(Math.min(210, W * 0.14), W * 0.16);

		const stripes = toneColors.map((color, k) => {
			const y1 = yStart + k * sw;
			const r1 = rb1 + (3 - k) * sw;
			const ymid1 = y1 + r1;
			const y2 = ymid1 + r1;

			const r2 = rb2 + k * sw;
			const ymid2 = y2 + r2;
			const y3 = ymid2 + r2;

			const d = `M -120,${y1.toFixed(1)} L ${xr1.toFixed(1)},${y1.toFixed(1)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 0 1 ${xr1.toFixed(1)},${y2.toFixed(1)} L ${xl1.toFixed(1)},${y2.toFixed(1)} A ${r2.toFixed(1)} ${r2.toFixed(1)} 0 0 0 ${xl1.toFixed(1)},${y3.toFixed(1)} L ${(W + 120).toFixed(1)},${y3.toFixed(1)}`;

			return { color, d };
		});

		return { sw, stripes };
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svg
	viewBox="0 0 {containerWidth} {containerHeight}"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="w-full h-full {className}"
	aria-hidden="true"
>
	<defs>
		<filter id="ribbon-mech-shadow" x="-5%" y="-5%" width="110%" height="110%">
			<feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#1E1B18" flood-opacity="0.08" />
		</filter>
	</defs>

	<g filter="url(#ribbon-mech-shadow)">
		{#each stripeData.stripes as s}
			<path
				d={s.d}
				stroke={s.color}
				stroke-width={stripeData.sw}
				stroke-linecap="square"
				stroke-linejoin="miter"
				fill="none"
			/>
		{/each}
	</g>
</svg>

