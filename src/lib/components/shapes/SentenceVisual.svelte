<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const slots = [
		{ label: "Subject", word: "我", tone: "var(--color-tone-3, #DC2626)" },
		{ label: "Time", word: "今天", tone: "var(--color-tone-1, #F59E0B)" },
		{ label: "Verb", word: "学", tone: "var(--color-tone-2, #EA580C)" },
		{ label: "Object", word: "中文", tone: "var(--color-tone-1, #F59E0B)" }
	];
</script>

<div class="flex flex-col gap-2 w-full {className}">
	<div class="grid grid-cols-4 gap-1.5">
		{#each slots as slot}
			<div class="flex flex-col items-center gap-1 p-1.5 bg-paper/60 border border-ink/20 rounded-xs">
				<span class="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{slot.label}</span>
				<span class="hanzi text-base font-bold text-ink px-1.5 py-0.5 rounded-xs" style="border-bottom: 2px solid {slot.tone}">
					{slot.word}
				</span>
			</div>
		{/each}
	</div>
	<div class="flex items-center justify-center gap-1 font-mono text-[11px] text-ink-muted bg-panel/40 py-1 px-2 border border-ink/10 rounded-xs">
		<span>S</span>
		<span>+</span>
		<span>T</span>
		<span>+</span>
		<span>V</span>
		<span>+</span>
		<span>O</span>
	</div>
</div>
