<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const stripes = [
		{ color: "var(--color-tone-1, #F59E0B)", offset: 0 },
		{ color: "var(--color-tone-2, #EA580C)", offset: 8 },
		{ color: "var(--color-tone-3, #DC2626)", offset: 16 },
		{ color: "var(--color-tone-4, #7F1D1D)", offset: 24 }
	];
</script>

<svg
	viewBox="0 0 1200 500"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="w-full h-auto {className}"
	preserveAspectRatio="xMidYMid meet"
	aria-hidden="true"
>
	<defs>
		<filter id="ribbon-shadow" x="-5%" y="-5%" width="110%" height="110%">
			<feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#1E1B18" />
		</filter>
	</defs>

	<g filter="url(#ribbon-shadow)">
		{#each stripes as stripe}
			<path
				d="M 0,{60 + stripe.offset}
				   L 450,{60 + stripe.offset}
				   A {60 + stripe.offset},{60 + stripe.offset} 0 0 1 {510 + stripe.offset},{120 + stripe.offset}
				   L {510 + stripe.offset},{180 + stripe.offset}
				   L {700 + stripe.offset},{370 + stripe.offset}
				   A {50 - stripe.offset},{50 - stripe.offset} 0 0 1 {750},{420 + stripe.offset}
				   L 1200,{420 + stripe.offset}"
				stroke={stripe.color}
				stroke-width="8"
				stroke-linecap="square"
				stroke-linejoin="round"
				fill="none"
			/>
			<path
				d="M 0,{420 - stripe.offset}
				   L 250,{420 - stripe.offset}
				   A {70 + stripe.offset},{70 + stripe.offset} 0 0 0 {320 + stripe.offset},{350 - stripe.offset}
				   L {320 + stripe.offset},{270 - stripe.offset}
				   A {50 - stripe.offset},{50 - stripe.offset} 0 0 1 {370},{220 - stripe.offset}
				   L 1200,{220 - stripe.offset}"
				stroke={stripe.color}
				stroke-width="8"
				stroke-linecap="square"
				stroke-linejoin="round"
				fill="none"
			/>
		{/each}
	</g>
</svg>
