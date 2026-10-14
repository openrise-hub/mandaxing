<script lang="ts">
	import VocabularyVisual from "#lib/components/shapes/VocabularyVisual.svelte";

	interface Props {
		title?: string;
		subtitle?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		title = "Vocabulary",
		onclick,
		class: className = ""
	}: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onclick?.();
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	{onclick}
	onkeydown={handleKeydown}
	class="retro-badge-card flex flex-col justify-between p-5 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 {className}"
	aria-label={title}
>
	<div class="flex h-1.5 w-full mb-3 rounded-xs overflow-hidden">
		<div class="flex-1 bg-[var(--color-tone-1)]"></div>
		<div class="flex-1 bg-[var(--color-tone-2)]"></div>
		<div class="flex-1 bg-[var(--color-tone-3)]"></div>
		<div class="flex-1 bg-[var(--color-tone-4)]"></div>
	</div>

	<div class="w-full my-auto flex justify-center py-3">
		<VocabularyVisual class="w-full max-w-[280px]" />
	</div>

	<div class="mt-3 pt-3 border-t border-[var(--color-ink)]/15">
		<h2 class="font-display text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
			{title}
		</h2>
	</div>
</div>
