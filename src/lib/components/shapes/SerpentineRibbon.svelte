<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const stripes = [
		{
			color: "var(--color-tone-1, #F59E0B)",
			k: 0,
			w: 10,
			topY: 60,
			r1: 55,
			r2: 25,
			miterX: 260
		},
		{
			color: "var(--color-tone-2, #EA580C)",
			k: 1,
			w: 10,
			topY: 70,
			r1: 45,
			r2: 35,
			miterX: 284.14
		},
		{
			color: "var(--color-tone-3, #DC2626)",
			k: 2,
			w: 10,
			topY: 80,
			r1: 35,
			r2: 45,
			miterX: 308.28
		},
		{
			color: "var(--color-tone-4, #7F1D1D)",
			k: 3,
			w: 10,
			topY: 90,
			r1: 25,
			r2: 55,
			miterX: 332.43
		}
	];
</script>

<svg
	viewBox="0 0 1200 560"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="w-full h-auto {className}"
	preserveAspectRatio="xMidYMid meet"
	aria-hidden="true"
>
	<defs>
		<filter id="ribbon-mech-shadow" x="-5%" y="-5%" width="110%" height="110%">
			<feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#1E1B18" />
		</filter>
	</defs>

	<g filter="url(#ribbon-mech-shadow)">
		{#each stripes as s}
			<!-- Top Serpentine: 45-deg straight diagonal -> straight horizontal -> 180-deg U-turn -> straight horizontal -> 180-deg U-turn -> straight horizontal -->
			<path
				d="M {170 + s.k * 14.14},0
				   L {s.miterX},{s.topY}
				   L 920,{s.topY}
				   A {s.r1} {s.r1} 0 0 1 920,{115 + s.r1}
				   L 320,{115 + s.r1}
				   A {s.r2} {s.r2} 0 0 0 320,{195 + s.r2}
				   L 1200,{195 + s.r2}"
				stroke={s.color}
				stroke-width="10"
				stroke-linecap="square"
				stroke-linejoin="miter"
				stroke-miterlimit="4"
				fill="none"
			/>

			<!-- Bottom Serpentine: straight horizontal -> 180-deg U-turn -> straight horizontal -> 180-deg U-turn -> straight horizontal -> 45-deg straight diagonal -->
			<path
				d="M 0,{310 + s.k * 10}
				   L 880,{310 + s.k * 10}
				   A {s.r1} {s.r1} 0 0 1 880,{365 + s.r1}
				   L 340,{365 + s.r1}
				   A {s.r2} {s.r2} 0 0 0 340,{445 + s.r2}
				   L {540 + s.k * 24.14},{445 + s.r2}
				   L {640 + s.k * 14.14},560"
				stroke={s.color}
				stroke-width="10"
				stroke-linecap="square"
				stroke-linejoin="miter"
				stroke-miterlimit="4"
				fill="none"
			/>
		{/each}
	</g>
</svg>
