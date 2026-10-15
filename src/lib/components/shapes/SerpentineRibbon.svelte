<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const stripes = [
		{
			color: "var(--color-tone-1, #F59E0B)",
			k: 0,
			topY: 80,
			r1: 55,
			midY: 190,
			r2: 55,
			botY: 300,
			lowTopY: 430,
			lowR1: 55,
			lowMidY: 540,
			lowR2: 55,
			lowBotY: 650
		},
		{
			color: "var(--color-tone-2, #EA580C)",
			k: 1,
			topY: 90,
			r1: 45,
			midY: 180,
			r2: 65,
			botY: 310,
			lowTopY: 440,
			lowR1: 45,
			lowMidY: 530,
			lowR2: 65,
			lowBotY: 660
		},
		{
			color: "var(--color-tone-3, #DC2626)",
			k: 2,
			topY: 100,
			r1: 35,
			midY: 170,
			r2: 75,
			botY: 320,
			lowTopY: 450,
			lowR1: 35,
			lowMidY: 520,
			lowR2: 75,
			lowBotY: 670
		},
		{
			color: "var(--color-tone-4, #7F1D1D)",
			k: 3,
			topY: 110,
			r1: 25,
			midY: 160,
			r2: 85,
			botY: 330,
			lowTopY: 460,
			lowR1: 25,
			lowMidY: 510,
			lowR2: 85,
			lowBotY: 680
		}
	];
</script>

<svg
	viewBox="0 0 1700 740"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="w-full h-auto {className}"
	preserveAspectRatio="none"
	aria-hidden="true"
>
	<defs>
		<filter id="ribbon-mech-shadow" x="-5%" y="-5%" width="110%" height="110%">
			<feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#1E1B18" />
		</filter>
	</defs>

	<g filter="url(#ribbon-mech-shadow)">
		{#each stripes as s}
			<!-- Upper continuous ribbon extending from offscreen left (-100) to offscreen right (1850) -->
			<path
				d="M -100,{s.topY}
				   L 1250,{s.topY}
				   A {s.r1} {s.r1} 0 0 1 1250,{s.midY}
				   L 350,{s.midY}
				   A {s.r2} {s.r2} 0 0 0 350,{s.botY}
				   L 1850,{s.botY}"
				stroke={s.color}
				stroke-width="10"
				stroke-linecap="square"
				stroke-linejoin="miter"
				fill="none"
			/>

			<!-- Lower continuous ribbon extending from offscreen left (-100) to offscreen right (1850) -->
			<path
				d="M -100,{s.lowTopY}
				   L 1350,{s.lowTopY}
				   A {s.lowR1} {s.lowR1} 0 0 1 1350,{s.lowMidY}
				   L 250,{s.lowMidY}
				   A {s.lowR2} {s.lowR2} 0 0 0 250,{s.lowBotY}
				   L 1850,{s.lowBotY}"
				stroke={s.color}
				stroke-width="10"
				stroke-linecap="square"
				stroke-linejoin="miter"
				fill="none"
			/>
		{/each}
	</g>
</svg>
