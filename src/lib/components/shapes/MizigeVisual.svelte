<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Bold Circular Ring with bottom notch like Badge 32 in reference image -->
		<!-- Outer Arc (Tone 3 Vermilion Red) -->
		<path
			d="M 52,126 A 50 50 0 1 1 108,126"
			stroke="var(--color-tone-3, #DC2626)"
			stroke-width="16"
			stroke-linecap="square"
			fill="none"
		/>

		<!-- Concentric Inner Arc (Tone 2 Rust Orange) -->
		<path
			d="M 60,113 A 34 34 0 1 1 100,113"
			stroke="var(--color-tone-2, #EA580C)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>

		<!-- Core Disc (Tone 1 Mustard Yellow) -->
		<circle cx="80" cy="74" r="16" fill="var(--color-tone-1, #F59E0B)" />

		<!-- Bottom Notch Accent (Paper Cream) -->
		<circle cx="80" cy="126" r="6" fill="#F4EFEA" />
	</svg>
</div>
