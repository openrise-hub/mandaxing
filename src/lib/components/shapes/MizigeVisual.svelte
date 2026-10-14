<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full aspect-square max-w-[140px] mx-auto {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Background Chamber -->
		<rect x="6" y="6" width="148" height="148" rx="3" fill="#FFFFFF" stroke="#1E1B18" stroke-width="2" />

		<!-- Outer Circle Ring (Tone 4 Mahogany) -->
		<circle cx="80" cy="80" r="54" stroke="var(--color-tone-4, #7F1D1D)" stroke-width="8" />

		<!-- Middle Outer Ring (Tone 3 Vermilion) -->
		<circle cx="80" cy="80" r="44" stroke="var(--color-tone-3, #DC2626)" stroke-width="8" />

		<!-- Middle Inner Ring (Tone 2 Orange) -->
		<circle cx="80" cy="80" r="34" stroke="var(--color-tone-2, #EA580C)" stroke-width="8" />

		<!-- Inner Ring (Tone 1 Yellow) -->
		<circle cx="80" cy="80" r="24" stroke="var(--color-tone-1, #F59E0B)" stroke-width="8" />

		<!-- Central Core -->
		<circle cx="80" cy="80" r="14" fill="#1E1B18" />

		<!-- Mechanical vertical slot cutout at bottom like Badge 32 -->
		<rect x="74" y="80" width="12" height="58" fill="#FFFFFF" stroke="#1E1B18" stroke-width="1.5" />
		<line x1="80" y1="94" x2="80" y2="136" stroke="#1E1B18" stroke-width="1.5" stroke-dasharray="3 3" />
	</svg>
</div>
