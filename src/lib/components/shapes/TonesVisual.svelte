<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full aspect-square max-w-[140px] mx-auto {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<defs>
			<clipPath id="tone-split-1">
				<rect x="0" y="0" width="160" height="46" />
			</clipPath>
			<clipPath id="tone-split-2">
				<rect x="0" y="46" width="160" height="34" />
			</clipPath>
			<clipPath id="tone-split-3">
				<rect x="0" y="80" width="160" height="36" />
			</clipPath>
			<clipPath id="tone-split-4">
				<rect x="0" y="116" width="160" height="44" />
			</clipPath>
		</defs>

		<!-- Background Chamber -->
		<rect x="6" y="6" width="148" height="148" rx="3" fill="#FFFFFF" stroke="#1E1B18" stroke-width="2" />

		<!-- Part 1: Top section of 声 (Tone 1 Mustard Yellow) -->
		<g clip-path="url(#tone-split-1)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="112"
				fill="var(--color-tone-1, #F59E0B)"
				stroke="#1E1B18"
				stroke-width="3"
				paint-order="stroke fill"
			>声</text>
		</g>

		<!-- Part 2: Upper-mid section of 声 (Tone 2 Rust Orange) -->
		<g clip-path="url(#tone-split-2)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="112"
				fill="var(--color-tone-2, #EA580C)"
				stroke="#1E1B18"
				stroke-width="3"
				paint-order="stroke fill"
			>声</text>
		</g>

		<!-- Part 3: Lower-mid section of 声 (Tone 3 Vermilion Red) -->
		<g clip-path="url(#tone-split-3)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="112"
				fill="var(--color-tone-3, #DC2626)"
				stroke="#1E1B18"
				stroke-width="3"
				paint-order="stroke fill"
			>声</text>
		</g>

		<!-- Part 4: Bottom section of 声 (Tone 4 Mahogany Red) -->
		<g clip-path="url(#tone-split-4)">
			<text
				x="80"
				y="126"
				text-anchor="middle"
				font-family="'Noto Sans SC', sans-serif"
				font-weight="900"
				font-size="112"
				fill="var(--color-tone-4, #7F1D1D)"
				stroke="#1E1B18"
				stroke-width="3"
				paint-order="stroke fill"
			>声</text>
		</g>

		<!-- Subtle technical split dividers -->
		<line x1="16" y1="46" x2="144" y2="46" stroke="#1E1B18" stroke-width="0.75" stroke-dasharray="2 2" stroke-opacity="0.3" />
		<line x1="16" y1="80" x2="144" y2="80" stroke="#1E1B18" stroke-width="0.75" stroke-dasharray="2 2" stroke-opacity="0.3" />
		<line x1="16" y1="116" x2="144" y2="116" stroke="#1E1B18" stroke-width="0.75" stroke-dasharray="2 2" stroke-opacity="0.3" />
	</svg>
</div>
