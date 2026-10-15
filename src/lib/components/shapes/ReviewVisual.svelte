<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const upperBars = [
		{ y: 34, height: 6 },
		{ y: 44, height: 6 },
		{ y: 54, height: 6 },
		{ y: 64, height: 6 },
		{ y: 74, height: 6 }
	];
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<defs>
			<clipPath id="sun-upper-half">
				<path d="M 30,82 A 50 50 0 0 1 130,82 Z" />
			</clipPath>
		</defs>

		<g clip-path="url(#sun-upper-half)">
			{#each upperBars as bar}
				<rect x="25" y={bar.y} width="110" height={bar.height} fill="var(--color-tone-1, #F59E0B)" />
			{/each}
		</g>

		<path
			d="M 30,84 A 50 50 0 0 0 130,84 Z"
			fill="var(--color-tone-2, #EA580C)"
		/>
	</svg>
</div>
