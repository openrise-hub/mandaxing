<script lang="ts">
	import { onMount } from "svelte";
	import CategoryReviewButton from "#lib/components/CategoryReviewButton.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
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
	<SectionHeader
		title={t().matrix.title}
		subtitle={t().matrix.subtitle}
	>
		<span class="data-pill px-2.5 py-1 text-xs font-mono tabular-nums font-bold">
			{wordMatrix.filteredWords.length} {t().matrix.wordsCount}
		</span>
	</SectionHeader>

	<!-- 8 Category Tabs -->
	<div class="flex flex-wrap items-center gap-2" role="tablist" aria-label={t().matrix.title}>
		{#each CATEGORIES as cat (cat.key)}
			<button
				type="button"
				role="tab"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-card={wordMatrix.selectedCategory === cat.key}
				class:text-ink={wordMatrix.selectedCategory === cat.key}
				class:shadow-[2px_2px_0px_#1E1B18]={wordMatrix.selectedCategory === cat.key}
				aria-selected={wordMatrix.selectedCategory === cat.key}
				onclick={() => handleCategoryChange(cat.key)}
			>
				{i18n.current === "es" ? cat.labelEs : cat.labelEn}
				<span class="ml-1 opacity-60 font-mono tabular-nums">({cat.items.length})</span>
			</button>
		{/each}
	</div>

	<!-- Accessible Search Input Filter -->
	<div class="mech-card p-3 flex items-center gap-3">
		<label for="vocab-search" class="sr-only">{t().common.search}</label>
		<svg class="w-4 h-4 text-ink-muted flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
		</svg>
		<input
			id="vocab-search"
			name="search"
			type="search"
			autocomplete="off"
			spellcheck={false}
			bind:value={wordMatrix.searchQuery}
			placeholder={t().matrix.searchPlaceholder}
			class="w-full bg-transparent font-sans text-sm outline-none text-ink placeholder:text-ink-muted/60"
		/>
		{#if wordMatrix.searchQuery}
			<button
				type="button"
				onclick={() => { wordMatrix.searchQuery = ""; }}
				class="text-xs font-mono text-ink-muted hover:text-ink cursor-pointer px-1.5 py-0.5"
				aria-label={t().common.clear}
			>
				<span aria-hidden="true">&times;</span>
			</button>
		{/if}
	</div>

	<!-- Vocabulary Data Table -->
	<div class="mech-card overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse" aria-label={t().matrix.title}>
				<thead>
					<tr class="border-b border-ink bg-panel font-display text-xs uppercase tracking-wider text-ink">
						<th scope="col" class="py-3 px-4">{t().matrix.character}</th>
						<th scope="col" class="py-3 px-4">{t().matrix.pinyin}</th>
						<th scope="col" class="py-3 px-4">{t().matrix.meaning}</th>
						<th scope="col" class="py-3 px-4 text-center">{t().matrix.stability}</th>
						<th scope="col" class="py-3 px-4 text-right">{t().matrix.audio}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-ink/15">
					{#if wordMatrix.filteredWords.length === 0}
						<tr>
							<td colspan="5" class="py-8 text-center text-sm text-ink-muted">
								{t().matrix.noResults}
							</td>
						</tr>
					{:else}
						{#each wordMatrix.filteredWords as item (item.id)}
							<tr class="hover:bg-panel/40 transition-colors">
								<td class="py-3 px-4 font-hanzi text-2xl font-bold text-ink">
									{item.characters}
								</td>
								<td class="py-3 px-4 font-mono text-sm font-medium text-ink">
									{item.pinyin}
								</td>
								<td class="py-3 px-4 font-sans text-sm text-ink-muted">
									{i18n.current === "es" ? item.es : item.en}
								</td>
								<td class="py-3 px-4 text-center">
									{#if wordMatrix.stabilityMap[item.id]}
										<span class="data-pill px-2 py-0.5 text-xs text-success bg-paper font-mono tabular-nums">
											{wordMatrix.stabilityMap[item.id]}d
										</span>
									{:else}
										<span class="font-mono text-xs text-ink-muted/60 tabular-nums">
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
											<span>…</span>
										{:else}
											<span aria-hidden="true">&#9658;</span>
										{/if}
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Bottom Category Practice Bar -->
		<CategoryReviewButton />
	</div>
</div>
