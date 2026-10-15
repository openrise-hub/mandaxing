<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<defs>
			<clipPath id="hanzi-stripe-1">
				<rect x="0" y="0" width="160" height="44" />
			</clipPath>
			<clipPath id="hanzi-stripe-2">
				<rect x="0" y="44" width="160" height="34" />
			</clipPath>
			<clipPath id="hanzi-stripe-3">
				<rect x="0" y="78" width="160" height="36" />
			</clipPath>
			<clipPath id="hanzi-stripe-4">
				<rect x="0" y="114" width="160" height="46" />
			</clipPath>
		</defs>

		<g clip-path="url(#hanzi-stripe-1)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="118"
				fill="var(--color-tone-1, #F59E0B)"
			>声</text>
		</g>

		<g clip-path="url(#hanzi-stripe-2)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="118"
				fill="var(--color-tone-2, #EA580C)"
			>声</text>
		</g>

		<g clip-path="url(#hanzi-stripe-3)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="118"
				fill="var(--color-tone-3, #DC2626)"
			>声</text>
		</g>

		<g clip-path="url(#hanzi-stripe-4)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="118"
				fill="var(--color-tone-4, #7F1D1D)"
			>声</text>
		</g>
	</svg>
</div>
