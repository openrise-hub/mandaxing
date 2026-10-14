<script lang="ts">
	import { i18n } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { wordMatrix } from "#lib/state/word-matrix.svelte";

	function launchPractice() {
		appView.set("review");
	}
</script>

<div class="flex items-center justify-between p-4 bg-[var(--color-panel)] border-t border-[var(--color-ink)]">
	<div class="text-xs font-mono text-[var(--color-ink-muted)]">
		<span>{wordMatrix.filteredWords.length}</span>
		<span>{i18n.current === "es" ? "palabras en categoría" : "words in category"}</span>
	</div>

	<button
		type="button"
		onclick={launchPractice}
		class="mech-btn px-4 py-2 font-display text-sm font-bold bg-[var(--color-action)] text-white hover:bg-blue-700 cursor-pointer transition-colors"
	>
		{i18n.current === "es" ? "Practicar Categoría" : "Practice Category"}
	</button>
</div>
