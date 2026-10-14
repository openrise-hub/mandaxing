<script lang="ts">
	import WordChip from "#lib/components/WordChip.svelte";
	import { i18n } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { syntaxAssembly } from "#lib/state/syntax-assembly.svelte";

	let current = $derived(syntaxAssembly.currentSentence);
	let placed = $derived(syntaxAssembly.placedWords);
	let available = $derived(syntaxAssembly.availablePool);
	let validation = $derived(syntaxAssembly.validation);
</script>

<div class="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<!-- Top Bar with Return Navigation -->
	<div class="flex items-center justify-between border-b-2 border-[var(--color-ink)]/15 pb-4">
		<div>
			<h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
				{i18n.current === "es" ? "Constructor de Oraciones" : "Sentence Builder"}
			</h1>
			<p class="font-sans text-xs md:text-sm text-[var(--color-ink-muted)] mt-1">
				{i18n.current === "es"
					? "Práctica de ensamblado sintáctico según el orden estándar"
					: "Mandarin syntax assembly and word ordering drills"}
			</p>
		</div>

		<button
			type="button"
			onclick={() => appView.set("dashboard")}
			class="mech-btn px-4 py-2 font-display text-sm font-bold flex items-center gap-2 cursor-pointer"
		>
			<span aria-hidden="true">&larr;</span>
			<span>{i18n.current === "es" ? "Volver" : "Back"}</span>
		</button>
	</div>

	<!-- Target Prompt Card -->
	<section class="mech-card p-6 flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="data-pill px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] bg-[var(--color-paper)]">
				{i18n.current === "es" ? "Objetivo" : "Target"} {syntaxAssembly.currentIndex + 1} / {syntaxAssembly.sentences.length}
			</span>
			<span class="font-mono text-xs text-[var(--color-ink-muted)]">
				S + T + L + V + O
			</span>
		</div>

		<div class="py-2">
			<h2 class="font-display text-2xl font-bold text-[var(--color-ink)]">
				{i18n.current === "es" ? current.promptEs : current.promptEn}
			</h2>
		</div>
	</section>

	<!-- Slot Assembly Track -->
	<section class="mech-card p-6 flex flex-col gap-4 bg-[var(--color-paper)]/50 min-h-[140px]">
		<div class="flex items-center justify-between border-b border-[var(--color-ink)]/15 pb-2">
			<span class="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
				{i18n.current === "es" ? "Ranura de Ensamblado" : "Assembly Slot Track"}
			</span>
			{#if placed.length > 0}
				<button
					type="button"
					onclick={() => syntaxAssembly.clear()}
					class="font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-alert)] transition-colors cursor-pointer"
				>
					{i18n.current === "es" ? "Limpiar" : "Clear"}
				</button>
			{/if}
		</div>

		<!-- Placed Chips -->
		<div class="flex flex-wrap items-center gap-3 min-h-[50px]">
			{#if placed.length === 0}
				<span class="font-mono text-sm text-[var(--color-ink-muted)]/60 italic">
					{i18n.current === "es" ? "Toque palabras abajo para colocarlas aquí..." : "Tap words below to place them in sequence..."}
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
		<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-ink)]/15">
			<div class="flex items-center gap-2">
				<button
					type="button"
					disabled={placed.length === 0}
					onclick={() => void syntaxAssembly.validate()}
					class="mech-btn px-5 py-2 font-display text-sm font-bold bg-[var(--color-action)] text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition-colors"
				>
					{i18n.current === "es" ? "Verificar Orden" : "Check Order"}
				</button>
			</div>

			{#if validation}
				<div
					class="data-pill px-3 py-1.5 text-xs font-bold"
					class:bg-green-100={validation.valid}
					class:text-[var(--color-success)]={validation.valid}
					class:border-[var(--color-success)]={validation.valid}
					class:bg-red-100={!validation.valid}
					class:text-[var(--color-alert)]={!validation.valid}
					class:border-[var(--color-alert)]={!validation.valid}
				>
					{i18n.current === "es" ? validation.messageEs : validation.messageEn}
				</div>
			{/if}
		</div>
	</section>

	<!-- Available Word Tray -->
	<section class="mech-card p-6 flex flex-col gap-3">
		<span class="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
			{i18n.current === "es" ? "Palabras Disponibles" : "Available Word Pool"}
		</span>

		<div class="flex flex-wrap gap-3 pt-1">
			{#each available as word (word.id)}
				<WordChip
					{word}
					onclick={() => syntaxAssembly.placeWord(word.id)}
				/>
			{/each}
			{#if available.length === 0 && placed.length > 0}
				<span class="font-mono text-xs text-[var(--color-ink-muted)]">
					{i18n.current === "es" ? "Todas las palabras colocadas" : "All available words placed"}
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
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer"
		>
			&larr; {i18n.current === "es" ? "Anterior" : "Previous"}
		</button>
		<button
			type="button"
			disabled={syntaxAssembly.currentIndex === syntaxAssembly.sentences.length - 1}
			onclick={() => syntaxAssembly.next()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer"
		>
			{i18n.current === "es" ? "Siguiente" : "Next"} &rarr;
		</button>
	</div>
</div>
