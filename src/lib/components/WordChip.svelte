<script lang="ts">
	import type { SyntaxWord } from "#lib/syntax/validator";

	interface Props {
		word: SyntaxWord;
		onclick?: () => void;
		onRemove?: () => void;
		inSlot?: boolean;
		class?: string;
	}

	let {
		word,
		onclick,
		onRemove,
		inSlot = false,
		class: className = "",
	}: Props = $props();

	const roleColors: Record<string, string> = {
		subject: "var(--color-action, #1D4ED8)",
		time: "var(--color-tone-1, #F59E0B)",
		location: "var(--color-tone-2, #EA580C)",
		negation: "var(--color-alert, #B91C1C)",
		verb: "var(--color-tone-3, #DC2626)",
		object: "var(--color-ink, #1E1B18)",
	};
</script>

<button
	type="button"
	onclick={inSlot ? onRemove : onclick}
	class="mech-btn flex items-center gap-2 px-3 py-2 cursor-pointer transition-transform group text-left {className}"
	aria-label="{word.characters} ({word.pinyin}) - {word.role}"
>
	<!-- Role color indicator dot/stripe -->
	<span
		class="w-2.5 h-2.5 rounded-full flex-shrink-0"
		style="background-color: {roleColors[word.role] ?? 'var(--color-ink)'}"
		title={word.role}
	></span>

	<!-- Character and Pinyin -->
	<div class="flex flex-col">
		<span class="font-hanzi text-lg font-bold text-[var(--color-ink)] leading-none">
			{word.characters}
		</span>
		<span class="font-mono text-[11px] text-[var(--color-ink-muted)] leading-tight mt-0.5">
			{word.pinyin}
		</span>
	</div>

	{#if inSlot}
		<span class="text-xs text-[var(--color-ink-muted)] group-hover:text-[var(--color-alert)] ml-1 font-bold">
			&times;
		</span>
	{/if}
</button>
