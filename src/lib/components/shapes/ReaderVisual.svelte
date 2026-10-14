<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="flex items-center justify-between gap-3 w-full {className}">
	<svg viewBox="0 0 60 36" class="h-8 w-14" fill="none" aria-hidden="true">
		<path
			d="M 5,8 Q 20,4 30,10 Q 40,4 55,8 L 55,30 Q 40,26 30,32 Q 20,26 5,30 Z"
			fill="var(--color-card, #FFFFFF)"
			stroke="#1E1B18"
			stroke-width="1.5"
		/>
		<line x1="30" y1="10" x2="30" y2="32" stroke="#1E1B18" stroke-width="1.2" />
		<line x1="10" y1="14" x2="25" y2="14" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
		<line x1="10" y1="19" x2="23" y2="19" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
		<line x1="10" y1="24" x2="25" y2="24" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
		<line x1="35" y1="14" x2="50" y2="14" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
		<line x1="35" y1="19" x2="48" y2="19" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
		<line x1="35" y1="24" x2="50" y2="24" stroke="#1E1B18" stroke-width="0.8" stroke-opacity="0.5" />
	</svg>
	<svg viewBox="0 0 24 24" class="h-5 w-5 text-ink-muted" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15" />
		<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
		<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
	</svg>
</div>
