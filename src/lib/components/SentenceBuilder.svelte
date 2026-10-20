<script lang="ts">
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import WordChip from "#lib/components/WordChip.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { syntaxAssembly } from "#lib/state/syntax-assembly.svelte";

	let current = $derived(syntaxAssembly.currentSentence);
	let placed = $derived(syntaxAssembly.placedWords);
	let available = $derived(syntaxAssembly.availablePool);
	let validation = $derived(syntaxAssembly.validation);
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={t().sentenceBuilder.title}
		subtitle={t().sentenceBuilder.subtitle}
	>
		<span class="data-pill px-2.5 py-1 text-xs font-mono tabular-nums font-bold">
			{t().sentenceBuilder.target} {syntaxAssembly.currentIndex + 1} / {syntaxAssembly.sentences.length}
		</span>
	</SectionHeader>

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
	<section class="mech-card p-6 flex flex-col gap-4 bg-paper/50 min-h-[140px]">
		<div class="flex items-center justify-between border-b border-ink/15 pb-2">
			<span class="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
				{t().sentenceBuilder.trackTitle}
			</span>
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

		<!-- Placed Chips -->
		<div class="flex flex-wrap items-center gap-3 min-h-[50px]">
			{#if placed.length === 0}
				<span class="font-mono text-sm text-ink-muted/60 italic">
					{t().sentenceBuilder.instruction}
				</span>
			{:else}
				{#each placed as word (word.id)}
					<WordChip
						{word}
						inSlot={true}
						onRemove={() => syntaxAssembly.removeWord(word.id)}
					/>
				{/each}
			{/if}
		</div>

		<!-- Validation Controls & Feedback -->
		<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/15">
			<div class="flex items-center gap-2">
				<button
					type="button"
					disabled={placed.length === 0}
					onclick={() => void syntaxAssembly.validate()}
					class="mech-btn px-5 py-2 font-display text-sm font-bold bg-action text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition-colors"
				>
					{t().sentenceBuilder.checkOrder}
				</button>
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
		<span class="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
			{t().sentenceBuilder.availableTitle}
		</span>

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
			<span aria-hidden="true">&larr;</span>
			<span>{t().common.previous}</span>
		</button>
		<button
			type="button"
			disabled={syntaxAssembly.currentIndex === syntaxAssembly.sentences.length - 1}
			onclick={() => syntaxAssembly.next()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
		>
			<span>{t().common.next}</span>
			<span aria-hidden="true">&rarr;</span>
		</button>
	</div>
</div>
