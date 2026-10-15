<script lang="ts">
	import { onMount } from "svelte";
	import HanziEmblem from "#lib/components/emblems/HanziEmblem.svelte";
	import ReaderEmblem from "#lib/components/emblems/ReaderEmblem.svelte";
	import ReviewEmblem from "#lib/components/emblems/ReviewEmblem.svelte";
	import SentencesEmblem from "#lib/components/emblems/SentencesEmblem.svelte";
	import TonesEmblem from "#lib/components/emblems/TonesEmblem.svelte";
	import VocabularyEmblem from "#lib/components/emblems/VocabularyEmblem.svelte";
	import SerpentineRibbon from "#lib/components/shapes/SerpentineRibbon.svelte";
	import { i18n } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { review } from "#lib/state/daily-review.svelte";

	onMount(() => {
		void review.init();
	});
</script>

<!-- Full-bleed background serpentine ribbon spanning the whole screen edge to edge -->
<div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden flex items-center justify-center select-none">
	<SerpentineRibbon class="w-full h-full min-w-full min-h-full opacity-60" />
</div>

<div class="w-full max-w-6xl mx-auto px-4 py-8 md:py-16">
	<!-- Primary Study Emblems: 6 authentic badge cards across the Swiss grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5 justify-items-center items-stretch">
		<div class="w-full max-w-[170px]">
			<TonesEmblem
				title={i18n.current === "es" ? "Tonos" : "Tones"}
				onclick={() => appView.set("lab")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<HanziEmblem
				title={i18n.current === "es" ? "Caracteres" : "Hanzi"}
				onclick={() => appView.set("studio")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<SentencesEmblem
				title={i18n.current === "es" ? "Oraciones" : "Sentences"}
				onclick={() => appView.set("sentences")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<VocabularyEmblem
				title={i18n.current === "es" ? "Vocabulario" : "Vocabulary"}
				onclick={() => appView.set("matrix")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<ReviewEmblem
				title={i18n.current === "es" ? "Repaso Diario" : "Daily Review"}
				onclick={() => appView.set("review")}
			/>
		</div>

		<div class="w-full max-w-[170px]">
			<ReaderEmblem
				title={i18n.current === "es" ? "Lecturas" : "Graded Reader"}
				onclick={() => appView.set("reader")}
			/>
		</div>
	</div>
</div>
