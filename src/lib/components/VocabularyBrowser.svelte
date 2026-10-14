<script lang="ts">
	import { onMount } from "svelte";
	import CategoryReviewButton from "#lib/components/CategoryReviewButton.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import {
		CATEGORIES,
		type WordCategory,
		wordMatrix,
	} from "#lib/state/word-matrix.svelte";

	onMount(() => {
		void wordMatrix.loadStability();
	});

	function handleCategoryChange(key: WordCategory) {
		wordMatrix.selectedCategory = key;
	}
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<!-- Top Bar with Return Navigation -->
	<div class="flex items-center justify-between border-b-2 border-[var(--color-ink)]/15 pb-4">
		<div>
			<h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
				{i18n.current === "es" ? "Matriz de Vocabulario" : "Vocabulary Matrix"}
			</h1>
			<p class="font-sans text-xs md:text-sm text-[var(--color-ink-muted)] mt-1">
				{i18n.current === "es"
					? "Bancos de palabras esenciales en 8 categorías gramaticales"
					: "Core high-yield vocabulary across 8 grammatical categories"}
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

	<!-- 8 Category Tabs -->
	<div class="flex flex-wrap items-center gap-2">
		{#each CATEGORIES as cat (cat.key)}
			<button
				type="button"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-[var(--color-card)]={wordMatrix.selectedCategory === cat.key}
				class:text-[var(--color-ink)]={wordMatrix.selectedCategory === cat.key}
				class:border-[var(--color-ink)]={wordMatrix.selectedCategory === cat.key}
				class:shadow-[2px_2px_0px_#1E1B18]={wordMatrix.selectedCategory === cat.key}
				aria-pressed={wordMatrix.selectedCategory === cat.key}
				onclick={() => handleCategoryChange(cat.key)}
			>
				{i18n.current === "es" ? cat.labelEs : cat.labelEn}
				<span class="ml-1 opacity-60">({cat.items.length})</span>
			</button>
		{/each}
	</div>

	<!-- Search Input Filter -->
	<div class="mech-card p-3 flex items-center gap-3">
		<svg class="w-4 h-4 text-[var(--color-ink-muted)]" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
		</svg>
		<input
			type="text"
			bind:value={wordMatrix.searchQuery}
			placeholder={i18n.current === "es" ? "Buscar por caracter, pinyin o significado..." : "Search by character, pinyin, or meaning..."}
			class="w-full bg-transparent font-sans text-sm outline-none text-[var(--color-ink)]"
		/>
		{#if wordMatrix.searchQuery}
			<button
				type="button"
				onclick={() => { wordMatrix.searchQuery = ""; }}
				class="text-xs font-mono text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
			>
				&times;
			</button>
		{/if}
	</div>

	<!-- Vocabulary Data Table -->
	<div class="mech-card overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-[var(--color-ink)] bg-[var(--color-panel)] font-display text-xs uppercase tracking-wider text-[var(--color-ink)]">
						<th class="py-3 px-4">{i18n.current === "es" ? "Caracter" : "Character"}</th>
						<th class="py-3 px-4">{i18n.current === "es" ? "Pinyin" : "Pinyin"}</th>
						<th class="py-3 px-4">{i18n.current === "es" ? "Significado" : "Meaning"}</th>
						<th class="py-3 px-4 text-center">{i18n.current === "es" ? "Estabilidad" : "Stability"}</th>
						<th class="py-3 px-4 text-right">{i18n.current === "es" ? "Audio" : "Audio"}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[var(--color-ink)]/15">
					{#each wordMatrix.filteredWords as item (item.id)}
						<tr class="hover:bg-[var(--color-panel)]/40 transition-colors">
							<td class="py-3 px-4 font-hanzi text-2xl font-bold text-[var(--color-ink)]">
								{item.characters}
							</td>
							<td class="py-3 px-4 font-mono text-sm font-medium text-[var(--color-ink)]">
								{item.pinyin}
							</td>
							<td class="py-3 px-4 font-sans text-sm text-[var(--color-ink-muted)]">
								{i18n.current === "es" ? item.es : item.en}
							</td>
							<td class="py-3 px-4 text-center">
								{#if wordMatrix.stabilityMap[item.id]}
									<span class="data-pill px-2 py-0.5 text-xs text-[var(--color-success)] bg-[var(--color-paper)]">
										{wordMatrix.stabilityMap[item.id]}d
									</span>
								{:else}
									<span class="font-mono text-xs text-[var(--color-ink-muted)]/60">
										new
									</span>
								{/if}
							</td>
							<td class="py-3 px-4 text-right">
								<button
									type="button"
									disabled={wordMatrix.playingId === item.id}
									onclick={() => void wordMatrix.playAudio(item)}
									class="mech-btn px-2.5 py-1 text-xs font-mono inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
									aria-label="{t().common.playAudio}: {item.characters}"
								>
									{#if wordMatrix.playingId === item.id}
										<span>...</span>
									{:else}
										<span aria-hidden="true">&#9658;</span>
									{/if}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Bottom Category Practice Bar -->
		<CategoryReviewButton />
	</div>
</div>
