<script lang="ts">
	import { i18n } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import {
		type CharacterWordLookup,
		gradedReader,
	} from "#lib/state/graded-reader.svelte";
	import { studio } from "#lib/state/hanzi-studio.svelte";

	interface Props {
		lookup: CharacterWordLookup;
	}

	let { lookup }: Props = $props();

	function practiceCharacter() {
		gradedReader.closePopover();
		void studio.selectCharacter(lookup.character);
		appView.set("studio");
	}
</script>

<div
	class="mech-card absolute z-50 p-4 w-64 bg-[var(--color-card)] shadow-[4px_4px_0px_#1E1B18] flex flex-col gap-3"
	role="dialog"
	aria-modal="true"
	aria-label="Character dictionary breakdown: {lookup.character}"
>
	<div class="flex items-start justify-between border-b border-[var(--color-ink)]/15 pb-2">
		<div class="flex items-baseline gap-2">
			<span class="font-hanzi text-4xl font-bold text-[var(--color-ink)] leading-none">
				{lookup.character}
			</span>
			<span class="font-mono text-base font-bold text-[var(--color-tone-2)]">
				{lookup.pinyin}
			</span>
		</div>
		<button
			type="button"
			onclick={() => gradedReader.closePopover()}
			class="text-sm font-mono text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer px-1"
			aria-label="Close"
		>
			×
		</button>
	</div>

	<p class="font-sans text-xs text-[var(--color-ink-muted)] leading-relaxed">
		{i18n.current === "es" ? lookup.es : lookup.en}
	</p>

	<div class="pt-1 border-t border-[var(--color-ink)]/15">
		<button
			type="button"
			onclick={practiceCharacter}
			class="mech-btn w-full py-1.5 font-display text-xs font-bold text-center bg-[var(--color-panel)] hover:bg-white cursor-pointer transition-colors"
		>
			{i18n.current === "es" ? "Practicar Trazo en Hanzi Studio" : "Trace in Hanzi Studio"} →
		</button>
	</div>
</div>
