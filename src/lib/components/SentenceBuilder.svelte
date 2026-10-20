<script lang="ts">
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import WordChip from "#lib/components/WordChip.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { syntaxAssembly } from "#lib/state/syntax-assembly.svelte";

	let current = $derived(syntaxAssembly.currentSentence);
	let placed = $derived(syntaxAssembly.placedWords);
	let available = $derived(syntaxAssembly.availablePool);
	let validation = $derived(syntaxAssembly.validation);

	let totalSlots = $derived(
		Math.max(current.targetOrder.length, placed.length),
	);
	let slots = $derived(Array.from({ length: totalSlots }, (_, i) => i));
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={t().sentenceBuilder.title}
		subtitle={t().sentenceBuilder.subtitle}
	/>

	<!-- Target Prompt Card -->
	<section class="mech-card p-6 flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="data-pill px-2.5 py-1 text-xs font-bold text-ink bg-paper font-mono tabular-nums">
				{t().sentenceBuilder.target} {syntaxAssembly.currentIndex + 1} / {syntaxAssembly.sentences.length}
			</span>
			<span class="font-mono text-xs text-ink-muted">
				{t().sentenceBuilder.formula}
			</span>
		</div>

		<div class="py-2">
			<h2 class="font-display text-2xl font-bold text-ink text-pretty">
				{i18n.current === "es" ? current.promptEs : current.promptEn}
			</h2>
		</div>
	</section>

	<!-- Slot Assembly Track -->
	<section class="mech-card p-6 flex flex-col gap-4 bg-paper/50 min-h-[160px]">
		<div class="flex items-center justify-between border-b border-ink/15 pb-2">
			<div class="flex items-center gap-2">
				<span class="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
					{t().sentenceBuilder.trackTitle}
				</span>
				<span class="data-pill px-2 py-0.5 text-[11px] font-mono tabular-nums text-ink-muted">
					{placed.length} / {current.targetOrder.length} {t().sentenceBuilder.wordsPlaced}
				</span>
			</div>
			{#if placed.length > 0}
				<button
					type="button"
					onclick={() => syntaxAssembly.clear()}
					class="font-mono text-xs text-ink-muted hover:text-alert transition-colors cursor-pointer px-2 py-0.5"
					aria-label={t().sentenceBuilder.clear}
				>
					{t().sentenceBuilder.clear}
				</button>
			{/if}
		</div>

		<!-- Discrete Dashed Slot Grid -->
		<div class="flex flex-wrap items-center gap-3 py-2 min-h-[70px]">
			{#each slots as index (index)}
				{#if index < placed.length && placed[index]}
					{@const word = placed[index]}
					<div class="relative group">
						<WordChip
							{word}
							inSlot={true}
							onRemove={() => syntaxAssembly.removeWord(word.id)}
						/>
					</div>
				{:else if index === placed.length}
					<!-- Active Target Slot -->
					<div
						class="min-h-[52px] min-w-[96px] px-3 py-2 border-2 border-dashed border-action bg-action/5 rounded-[2px] flex items-center justify-center gap-1.5 transition-all text-action"
						title={t().sentenceBuilder.tapToPlace}
					>
						<span class="font-mono text-xs font-bold tabular-nums">#{index + 1}</span>
						<span class="font-display text-xs font-bold uppercase tracking-wide">{t().sentenceBuilder.slotNext}</span>
					</div>
				{:else}
					<!-- Pending Slot -->
					<div
						class="min-h-[52px] min-w-[80px] px-3 py-2 border-2 border-dashed border-ink/20 bg-paper/30 rounded-[2px] flex items-center justify-center text-ink-muted/50"
					>
						<span class="font-mono text-xs tabular-nums font-bold">#{index + 1}</span>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Validation Controls and Feedback -->
		<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/15">
			<div class="flex items-center gap-3">
				<button
					type="button"
					disabled={placed.length === 0}
					onclick={() => void syntaxAssembly.validate()}
					class="mech-btn px-5 py-2 font-display text-sm font-bold bg-action text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition-colors"
				>
					{t().sentenceBuilder.checkOrder}
				</button>

				{#if validation?.valid && syntaxAssembly.currentIndex < syntaxAssembly.sentences.length - 1}
					<button
						type="button"
						onclick={() => syntaxAssembly.next()}
						class="mech-btn px-4 py-2 font-display text-sm font-bold bg-success text-white hover:bg-green-700 cursor-pointer transition-colors inline-flex items-center gap-1.5"
					>
						<span>{t().common.next}</span>
						<span aria-hidden="true">→</span>
					</button>
				{/if}
			</div>

			<div role="status" aria-live="polite">
				{#if validation}
					<div
						class="data-pill px-3 py-1.5 text-xs font-bold"
						class:bg-green-100={validation.valid}
						class:text-success={validation.valid}
						class:border-success={validation.valid}
						class:bg-red-100={!validation.valid}
						class:text-alert={!validation.valid}
						class:border-alert={!validation.valid}
					>
						{i18n.current === "es" ? validation.messageEs : validation.messageEn}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Available Word Tray -->
	<section class="mech-card p-6 flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
				{t().sentenceBuilder.availableTitle}
			</span>
			<span class="font-mono text-xs text-ink-muted">
				{t().sentenceBuilder.instruction}
			</span>
		</div>

		<div class="flex flex-wrap gap-3 pt-1">
			{#each available as word (word.id)}
				<WordChip
					{word}
					onclick={() => syntaxAssembly.placeWord(word.id)}
				/>
			{/each}
			{#if available.length === 0 && placed.length > 0}
				<span class="font-mono text-xs text-ink-muted">
					{t().sentenceBuilder.allPlaced}
				</span>
			{/if}
		</div>
	</section>

	<!-- Drill Step Navigation -->
	<div class="flex items-center justify-between pt-2">
		<button
			type="button"
			disabled={syntaxAssembly.currentIndex === 0}
			onclick={() => syntaxAssembly.previous()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
		>
			<span aria-hidden="true">←</span>
			<span>{t().common.previous}</span>
		</button>
		<button
			type="button"
			disabled={syntaxAssembly.currentIndex === syntaxAssembly.sentences.length - 1}
			onclick={() => syntaxAssembly.next()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
		>
			<span>{t().common.next}</span>
			<span aria-hidden="true">→</span>
		</button>
	</div>
</div>
