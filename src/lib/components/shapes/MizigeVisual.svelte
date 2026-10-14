<script lang="ts">
	interface Props {
		character?: string;
		class?: string;
	}

	let { character = "字", class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center aspect-square w-full max-w-[180px] mx-auto border-mech bg-card shadow-mechanical {className}">
	<svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
		<line x1="50" y1="0" x2="50" y2="100" stroke="#1E1B18" stroke-width="0.8" stroke-dasharray="2 2" stroke-opacity="0.35" />
		<line x1="0" y1="50" x2="100" y2="50" stroke="#1E1B18" stroke-width="0.8" stroke-dasharray="2 2" stroke-opacity="0.35" />
		<line x1="0" y1="0" x2="100" y2="100" stroke="#1E1B18" stroke-width="0.8" stroke-dasharray="2 2" stroke-opacity="0.25" />
		<line x1="100" y1="0" x2="0" y2="100" stroke="#1E1B18" stroke-width="0.8" stroke-dasharray="2 2" stroke-opacity="0.25" />
		<circle cx="50" cy="50" r="1.5" fill="#1E1B18" opacity="0.4" />
	</svg>
	<span class="hanzi text-6xl text-ink font-bold select-none z-10">{character}</span>
</div>
