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

		<!-- Pure Geometric Lines in 1970s multi-stripe style (Badge 5 / 19) -->
		<!-- Line 1: Yellow -->
		<rect x="22" y="30" width="116" height="14" rx="2" fill="var(--color-tone-1, #F59E0B)" stroke="#1E1B18" stroke-width="1.5" />

		<!-- Line 2: Orange (Stepped offset) -->
		<rect x="36" y="56" width="102" height="14" rx="2" fill="var(--color-tone-2, #EA580C)" stroke="#1E1B18" stroke-width="1.5" />

		<!-- Line 3: Vermilion (Stepped offset) -->
		<rect x="22" y="82" width="94" height="14" rx="2" fill="var(--color-tone-3, #DC2626)" stroke="#1E1B18" stroke-width="1.5" />

		<!-- Line 4: Mahogany -->
		<rect x="44" y="108" width="94" height="14" rx="2" fill="var(--color-tone-4, #7F1D1D)" stroke="#1E1B18" stroke-width="1.5" />

		<!-- Vertical connecting guide marks -->
		<line x1="36" y1="24" x2="36" y2="136" stroke="#1E1B18" stroke-width="1" stroke-dasharray="2 3" stroke-opacity="0.35" />
		<line x1="124" y1="24" x2="124" y2="136" stroke="#1E1B18" stroke-width="1" stroke-dasharray="2 3" stroke-opacity="0.35" />
	</svg>
</div>
