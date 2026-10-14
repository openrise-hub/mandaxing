<script lang="ts">
	import { onMount } from "svelte";
	import HanziEmblem from "#lib/components/emblems/HanziEmblem.svelte";
	import SentencesEmblem from "#lib/components/emblems/SentencesEmblem.svelte";
	import TonesEmblem from "#lib/components/emblems/TonesEmblem.svelte";
	import VocabularyEmblem from "#lib/components/emblems/VocabularyEmblem.svelte";
	import ReaderVisual from "#lib/components/shapes/ReaderVisual.svelte";
	import ReviewVisual from "#lib/components/shapes/ReviewVisual.svelte";
	import SerpentineRibbon from "#lib/components/shapes/SerpentineRibbon.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { review } from "#lib/state/daily-review.svelte";

	onMount(() => {
		void review.init();
	});

	function handleKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			action();
		}
	}
</script>

<div class="relative w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
	<!-- Decorative background serpentine ribbon weaving between sections -->
	<div class="absolute inset-0 pointer-events-none opacity-60 overflow-hidden -z-10 flex items-center justify-center">
		<SerpentineRibbon class="w-[140%] max-w-none transform -rotate-2 scale-105" />
	</div>

	<!-- Primary Study Emblems: Asymmetrical Swiss grid on desktop, single column on mobile -->
	<div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start mb-10">
		<div class="md:col-span-7">
			<TonesEmblem
				title={i18n.current === "es" ? "Tonos" : "Tones"}
				onclick={() => appView.set("lab")}
			/>
		</div>

		<div class="md:col-span-5 md:mt-8">
			<HanziEmblem
				title={i18n.current === "es" ? "Caracteres" : "Hanzi"}
				onclick={() => appView.set("studio")}
			/>
		</div>

		<div class="md:col-span-5 md:-mt-2">
			<SentencesEmblem
				title={i18n.current === "es" ? "Oraciones" : "Sentences"}
				onclick={() => appView.set("sentences")}
			/>
		</div>

		<div class="md:col-span-7">
			<VocabularyEmblem
				title={i18n.current === "es" ? "Vocabulario" : "Vocabulary"}
				onclick={() => appView.set("matrix")}
			/>
		</div>
	</div>

	<!-- Secondary Companion Row: Daily Review & Graded Reader -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-6 border-t-2 border-[var(--color-ink)]/15">
		<!-- Daily Review Companion Card -->
		<div
			role="button"
			tabindex="0"
			onclick={() => appView.set("review")}
			onkeydown={(e) => handleKeydown(e, () => appView.set("review"))}
			class="mech-btn flex items-center justify-between p-4 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform group"
			aria-label={i18n.current === "es" ? "Repaso Diario Spaced Repetition" : "Daily Review Spaced Repetition"}
		>
			<div class="flex items-center gap-3">
				<ReviewVisual class="w-12 h-12 flex-shrink-0" />
				<div>
					<h3 class="font-display text-lg font-bold text-[var(--color-ink)] transition-colors">
						{i18n.current === "es" ? "Repaso Diario" : "Daily Review"}
					</h3>
					<p class="font-sans text-xs text-[var(--color-ink-muted)]">
						{i18n.current === "es" ? "Repetición Espaciada" : "Spaced Repetition"}
					</p>
				</div>
			</div>

			<div class="text-right pl-2">
				{#if review.dueCount > 0}
					<span class="data-pill px-2.5 py-1 text-xs font-bold text-[var(--color-tone-2)] bg-[var(--color-paper)]">
						{review.dueCount} {i18n.current === "es" ? "Pendientes" : "Due"}
					</span>
				{:else}
					<span class="data-pill px-2.5 py-1 text-xs font-bold text-[var(--color-success)] bg-[var(--color-paper)]">
						{i18n.current === "es" ? "Al Día" : "Current"}
					</span>
				{/if}
			</div>
		</div>

		<!-- Graded Reader Companion Card -->
		<div
			role="button"
			tabindex="0"
			onclick={() => appView.set("reader")}
			onkeydown={(e) => handleKeydown(e, () => appView.set("reader"))}
			class="mech-btn flex items-center justify-between p-4 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform group"
			aria-label={i18n.current === "es" ? "Lecturas Graduadas" : "Graded Reader"}
		>
			<div class="flex items-center gap-3">
				<ReaderVisual class="w-12 h-12 flex-shrink-0" />
				<div>
					<h3 class="font-display text-lg font-bold text-[var(--color-ink)] transition-colors">
						{i18n.current === "es" ? "Lecturas" : "Graded Reader"}
					</h3>
					<p class="font-sans text-xs text-[var(--color-ink-muted)]">
						{i18n.current === "es" ? "Textos con Audio Sincronizado" : "Synchronized Audio Texts"}
					</p>
				</div>
			</div>

			<div class="text-right pl-2">
				<span class="data-pill px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] bg-[var(--color-paper)]">
					{i18n.current === "es" ? "Lecturas" : "Stories"}
				</span>
			</div>
		</div>
	</div>
</div>
