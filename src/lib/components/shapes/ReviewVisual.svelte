<script lang="ts">
	interface Props {
		dueCount?: number;
		class?: string;
	}

	let { dueCount = 0, class: className = "" }: Props = $props();
</script>

<div class="flex items-center justify-between gap-3 w-full {className}">
	<svg viewBox="0 0 100 40" class="h-9 w-24" fill="none" aria-hidden="true">
		<path d="M 5,35 Q 25,5 95,8" stroke="var(--color-tone-3, #DC2626)" stroke-width="2.5" stroke-linecap="round" fill="none" />
		<path d="M 5,35 L 95,35" stroke="#1E1B18" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="2 2" fill="none" />
		<circle cx="95" cy="8" r="3" fill="var(--color-tone-3, #DC2626)" />
	</svg>
	<span class="data-pill px-2 py-0.5 text-[11px] font-bold text-card {dueCount > 0 ? 'bg-tone-3' : 'bg-success'}">
		{dueCount > 0 ? `${dueCount} Due` : 'Caught Up'}
	</span>
</div>
