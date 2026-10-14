<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const toneRows = [
		{ name: "High Level", mark: "ā", color: "var(--color-tone-1, #F59E0B)", path: "M 10,12 L 110,12" },
		{ name: "Rising", mark: "á", color: "var(--color-tone-2, #EA580C)", path: "M 10,22 L 110,6" },
		{ name: "Low Dipping", mark: "ǎ", color: "var(--color-tone-3, #DC2626)", path: "M 10,8 Q 55,26 110,10" },
		{ name: "Falling", mark: "à", color: "var(--color-tone-4, #7F1D1D)", path: "M 10,6 L 110,24" }
	];
</script>

<div class="flex flex-col gap-2.5 w-full {className}">
	{#each toneRows as row}
		<div class="flex items-center justify-between gap-3 px-2 py-1 bg-paper/50 rounded-xs border border-ink/10">
			<span class="font-display text-xs font-medium text-ink-muted w-24">{row.name}</span>
			<svg viewBox="0 0 120 30" class="flex-1 h-6" preserveAspectRatio="none" aria-hidden="true">
				<path
					d={row.path}
					stroke={row.color}
					stroke-width="3"
					stroke-linecap="round"
					fill="none"
				/>
				<circle
					cx={row.path.includes("L 110,") ? 110 : 110}
					cy={row.path.endsWith("12") ? 12 : row.path.endsWith("6") ? 6 : row.path.endsWith("10") ? 10 : 24}
					r="3.5"
					fill={row.color}
				/>
			</svg>
			<span class="font-mono text-sm font-bold text-ink w-6 text-right" style="color: {row.color}">{row.mark}</span>
		</div>
	{/each}
</div>
