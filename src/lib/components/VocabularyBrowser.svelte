<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import CategoryReviewButton from "#lib/components/CategoryReviewButton.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import {
		CATEGORIES,
		type WordCategory,
		wordMatrix,
	} from "#lib/state/word-matrix.svelte";
	import type { WordBankEntry, WordBankItem } from "#lib/types/catalogs";

	type MatrixMode = "word-list" | "flashcards" | "learn" | "match";

	let currentMode = $state<MatrixMode>("word-list");

	onMount(() => {
		void wordMatrix.loadStability();
	});

	function handleCategoryChange(key: WordCategory) {
		wordMatrix.selectedCategory = key;
		resetFlashcard();
		resetLearn();
		initMatch();
	}

	function itemMeaning(item: WordBankItem | WordBankEntry): string {
		return i18n.current === "es" ? item.es : item.en;
	}

	// ---------------------------------------------------------------------------
	// Flashcards Mode State and Logic
	// ---------------------------------------------------------------------------
	let cardIndex = $state(0);
	let isFlipped = $state(false);

	let currentWordList = $derived(wordMatrix.activeCategory.items);
	let currentCard = $derived(
		currentWordList[cardIndex % currentWordList.length] ?? currentWordList[0],
	);

	function resetFlashcard() {
		cardIndex = 0;
		isFlipped = false;
	}

	function nextCard() {
		if (currentWordList.length === 0) return;
		cardIndex = (cardIndex + 1) % currentWordList.length;
		isFlipped = false;
	}

	function prevCard() {
		if (currentWordList.length === 0) return;
		cardIndex =
			(cardIndex - 1 + currentWordList.length) % currentWordList.length;
		isFlipped = false;
	}

	function flipCard() {
		isFlipped = !isFlipped;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (currentMode !== "flashcards") return;
		if (event.code === "Space" || event.key === "Enter") {
			event.preventDefault();
			flipCard();
		} else if (event.key === "ArrowRight") {
			nextCard();
		} else if (event.key === "ArrowLeft") {
			prevCard();
		}
	}

	// ---------------------------------------------------------------------------
	// Learn Mode (Quiz) State and Logic
	// ---------------------------------------------------------------------------
	let quizIndex = $state(0);
	let selectedOption = $state<string | null>(null);
	let quizAnswered = $state(false);
	let quizScore = $state({ correct: 0, total: 0 });
	let quizCompleted = $state(false);
	let quizOptions = $state<string[]>([]);

	let quizTarget = $derived(
		currentWordList[quizIndex % currentWordList.length],
	);

	function resetLearn() {
		quizIndex = 0;
		selectedOption = null;
		quizAnswered = false;
		quizScore = { correct: 0, total: 0 };
		quizCompleted = false;
		generateQuizOptions();
	}

	function generateQuizOptions() {
		const target = currentWordList[quizIndex % currentWordList.length];
		if (!target) return;
		const targetAnswer = itemMeaning(target);
		const others = currentWordList
			.filter((w) => w.id !== target.id)
			.map((w) => itemMeaning(w));

		// Deterministic pseudo-random shuffle for options
		const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
		const distractors = shuffledOthers.slice(0, 3);
		quizOptions = [...distractors, targetAnswer].sort(() => Math.random() - 0.5);
	}

	function answerQuiz(option: string) {
		if (quizAnswered || !quizTarget) return;
		selectedOption = option;
		quizAnswered = true;
		const isCorrect = option === itemMeaning(quizTarget);
		quizScore = {
			correct: quizScore.correct + (isCorrect ? 1 : 0),
			total: quizScore.total + 1,
		};
	}

	function advanceQuiz() {
		if (quizIndex + 1 >= currentWordList.length) {
			quizCompleted = true;
		} else {
			quizIndex++;
			selectedOption = null;
			quizAnswered = false;
			generateQuizOptions();
		}
	}

	// ---------------------------------------------------------------------------
	// Match Mode (Speed Tile Pairing) State and Logic
	// ---------------------------------------------------------------------------
	interface MatchTile {
		id: string;
		wordId: string;
		text: string;
		type: "hanzi" | "meaning";
		matched: boolean;
	}

	let matchTiles = $state<MatchTile[]>([]);
	let selectedTileA = $state<number | null>(null);
	let selectedTileB = $state<number | null>(null);
	let matchTimerSeconds = $state(0);
	let matchTimerActive = $state(false);
	let matchTimerInterval: ReturnType<typeof setInterval> | null = null;
	let matchGameCompleted = $state(false);
	let mismatchFlash = $state(false);

	function initMatch() {
		if (matchTimerInterval) clearInterval(matchTimerInterval);
		matchTimerActive = false;
		matchTimerSeconds = 0;
		matchGameCompleted = false;
		selectedTileA = null;
		selectedTileB = null;
		mismatchFlash = false;

		// Select up to 6 words
		const pool = [...currentWordList].sort(() => Math.random() - 0.5).slice(0, 6);
		const tiles: MatchTile[] = [];

		for (const word of pool) {
			tiles.push({
				id: `h_${word.id}`,
				wordId: word.id,
				text: word.characters,
				type: "hanzi",
				matched: false,
			});
			tiles.push({
				id: `m_${word.id}`,
				wordId: word.id,
				text: itemMeaning(word),
				type: "meaning",
				matched: false,
			});
		}

		matchTiles = tiles.sort(() => Math.random() - 0.5);
	}

	function startMatchTimer() {
		if (matchTimerActive) return;
		matchTimerActive = true;
		const startTime = performance.now();
		matchTimerInterval = setInterval(() => {
			matchTimerSeconds = Math.floor((performance.now() - startTime) / 100) / 10;
		}, 100);
	}

	function handleTileClick(index: number) {
		const tile = matchTiles[index];
		if (!tile || tile.matched || mismatchFlash) return;
		if (!matchTimerActive) startMatchTimer();

		if (selectedTileA === null) {
			selectedTileA = index;
			return;
		}

		if (selectedTileA === index) return;

		selectedTileB = index;
		const tileA = matchTiles[selectedTileA];
		const tileB = matchTiles[selectedTileB];

		if (
			tileA &&
			tileB &&
			tileA.wordId === tileB.wordId &&
			tileA.type !== tileB.type
		) {
			// Matched!
			tileA.matched = true;
			tileB.matched = true;
			selectedTileA = null;
			selectedTileB = null;

			if (matchTiles.every((t) => t.matched)) {
				if (matchTimerInterval) clearInterval(matchTimerInterval);
				matchTimerActive = false;
				matchGameCompleted = true;
			}
		} else {
			// Mismatch
			mismatchFlash = true;
			setTimeout(() => {
				selectedTileA = null;
				selectedTileB = null;
				mismatchFlash = false;
			}, 600);
		}
	}

	$effect(() => {
		if (currentMode === "learn" && quizOptions.length === 0) {
			generateQuizOptions();
		}
		if (currentMode === "match" && matchTiles.length === 0) {
			initMatch();
		}
	});

	onDestroy(() => {
		if (matchTimerInterval) clearInterval(matchTimerInterval);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={t().matrix.title}
		subtitle={t().matrix.subtitle}
	>
		<span class="data-pill px-2.5 py-1 text-xs font-mono tabular-nums font-bold">
			{wordMatrix.filteredWords.length} {t().matrix.wordsCount}
		</span>
	</SectionHeader>

	<!-- Mode Switcher Tabs -->
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-3">
		<div class="flex items-center gap-2" role="tablist" aria-label="Study Modes">
			<button
				type="button"
				role="tab"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-card={currentMode === "word-list"}
				class:text-ink={currentMode === "word-list"}
				class:shadow-[2px_2px_0px_#1E1B18]={currentMode === "word-list"}
				aria-selected={currentMode === "word-list"}
				onclick={() => { currentMode = "word-list"; }}
			>
				{t().matrix.wordList}
			</button>
			<button
				type="button"
				role="tab"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-card={currentMode === "flashcards"}
				class:text-ink={currentMode === "flashcards"}
				class:shadow-[2px_2px_0px_#1E1B18]={currentMode === "flashcards"}
				aria-selected={currentMode === "flashcards"}
				onclick={() => {
					currentMode = "flashcards";
					resetFlashcard();
				}}
			>
				{t().matrix.flashcards}
			</button>
			<button
				type="button"
				role="tab"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-card={currentMode === "learn"}
				class:text-ink={currentMode === "learn"}
				class:shadow-[2px_2px_0px_#1E1B18]={currentMode === "learn"}
				aria-selected={currentMode === "learn"}
				onclick={() => {
					currentMode = "learn";
					resetLearn();
				}}
			>
				{t().matrix.learn}
			</button>
			<button
				type="button"
				role="tab"
				class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
				class:bg-card={currentMode === "match"}
				class:text-ink={currentMode === "match"}
				class:shadow-[2px_2px_0px_#1E1B18]={currentMode === "match"}
				aria-selected={currentMode === "match"}
				onclick={() => {
					currentMode = "match";
					initMatch();
				}}
			>
				{t().matrix.match}
			</button>
		</div>

		<span class="font-mono text-xs text-ink-muted tabular-nums">
			{wordMatrix.activeCategory.items.length} {t().matrix.wordsCount}
		</span>
	</div>

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

	{#if currentMode === "word-list"}
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
					<span aria-hidden="true">×</span>
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
										{itemMeaning(item)}
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
												<span aria-hidden="true">▶</span>
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

	{:else if currentMode === "flashcards"}
		<!-- Flashcards Study Mode -->
		<div class="mx-auto flex w-full max-w-xl flex-col gap-6">
			{#if currentCard}
				<div class="flex items-center justify-between text-xs font-mono text-ink-muted">
					<span class="data-pill px-2.5 py-1 font-bold">
						{cardIndex + 1} / {currentWordList.length}
					</span>
					<span>{t().matrix.flipHint}</span>
				</div>

				<!-- Flashcard Mechanical Surface -->
				<div
					role="button"
					tabindex="0"
					onclick={flipCard}
					onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(); } }}
					class="mech-card min-h-[260px] p-8 flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:-translate-y-0.5 relative overflow-hidden text-center bg-card"
				>
					<!-- Tone Multi-Stripe Top Edge Accent -->
					<div class="absolute top-0 left-0 right-0 flex flex-col" aria-hidden="true">
						<span class="h-1 bg-tone-1"></span>
						<span class="h-1 bg-tone-2"></span>
						<span class="h-1 bg-tone-3"></span>
						<span class="h-1 bg-tone-4"></span>
					</div>

					<div class="absolute top-4 right-4">
						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								void wordMatrix.playAudio(currentCard);
							}}
							class="mech-btn px-3 py-1.5 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
							aria-label="{t().common.playAudio}: {currentCard.characters}"
						>
							<span aria-hidden="true">▶</span>
						</button>
					</div>

					{#if !isFlipped}
						<!-- Front of Card: Hanzi -->
						<div class="flex flex-col items-center gap-3">
							<span class="font-hanzi text-6xl font-bold text-ink">
								{currentCard.characters}
							</span>
							<span class="font-sans text-xs text-ink-muted mt-2">
								{t().matrix.flipHint}
							</span>
						</div>
					{:else}
						<!-- Back of Card: Pinyin and Meaning -->
						<div class="flex flex-col items-center gap-2">
							<span class="font-hanzi text-2xl font-bold text-ink-muted/80">
								{currentCard.characters}
							</span>
							<span class="font-mono text-3xl font-bold text-ink">
								{currentCard.pinyin}
							</span>
							<span class="font-sans text-lg font-bold text-action mt-1">
								{itemMeaning(currentCard)}
							</span>
							<div class="flex gap-1.5 mt-3">
								{#each currentCard.tones as tone}
									<span
										class="data-pill px-2.5 py-0.5 text-xs text-card font-bold"
										style="background-color: var(--color-tone-{tone});"
									>
										T{tone}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Navigation Controls -->
				<div class="flex items-center justify-between pt-2">
					<button
						type="button"
						disabled={cardIndex === 0}
						onclick={prevCard}
						class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
					>
						<span aria-hidden="true">←</span>
						<span>{t().common.previous}</span>
					</button>

					<button
						type="button"
						onclick={flipCard}
						class="mech-btn px-5 py-2 font-display text-sm font-bold bg-panel text-ink cursor-pointer"
					>
						{t().matrix.flip}
					</button>

					<button
						type="button"
						disabled={cardIndex === currentWordList.length - 1}
						onclick={nextCard}
						class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
					>
						<span>{t().common.next}</span>
						<span aria-hidden="true">→</span>
					</button>
				</div>
			{/if}
		</div>

	{:else if currentMode === "learn"}
		<!-- Learn Mode (Multiple Choice Quiz) -->
		<div class="mx-auto flex w-full max-w-xl flex-col gap-6">
			{#if quizCompleted}
				<div class="mech-card p-8 flex flex-col items-center gap-4 text-center">
					<span class="data-pill px-3 py-1 text-sm font-bold bg-success text-white">
						{t().matrix.testResult}
					</span>
					<h3 class="font-display text-2xl font-bold text-ink">
						{t().matrix.score}: {quizScore.correct} / {quizScore.total}
					</h3>
					<button
						type="button"
						onclick={resetLearn}
						class="mech-btn px-6 py-2.5 font-display text-sm font-bold bg-action text-white hover:bg-blue-700 cursor-pointer mt-2"
					>
						{t().matrix.playAgain}
					</button>
				</div>
			{:else if quizTarget}
				<div class="flex items-center justify-between text-xs font-mono text-ink-muted">
					<span class="data-pill px-2.5 py-1 font-bold">
						{t().matrix.question} {quizIndex + 1} / {currentWordList.length}
					</span>
					<span class="tabular-nums font-bold">
						{t().matrix.score}: {quizScore.correct} / {quizScore.total}
					</span>
				</div>

				<div class="mech-card p-6 flex flex-col items-center gap-3 text-center bg-card relative">
					<div class="absolute top-4 right-4">
						<button
							type="button"
							onclick={() => void wordMatrix.playAudio(quizTarget)}
							class="mech-btn px-3 py-1.5 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
							aria-label="{t().common.playAudio}: {quizTarget.characters}"
						>
							<span aria-hidden="true">▶</span>
						</button>
					</div>

					<span class="font-hanzi text-5xl font-bold text-ink">
						{quizTarget.characters}
					</span>
					<span class="font-mono text-lg font-bold text-ink-muted">
						{quizTarget.pinyin}
					</span>
				</div>

				<!-- 4 Option Buttons -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each quizOptions as opt}
						{@const isCorrect = opt === itemMeaning(quizTarget)}
						{@const isChosen = opt === selectedOption}
						<button
							type="button"
							disabled={quizAnswered}
							onclick={() => answerQuiz(opt)}
							class="mech-card p-4 font-sans text-sm font-bold text-left cursor-pointer transition-all disabled:cursor-default"
							class:bg-card={!quizAnswered}
							class:hover:bg-panel={!quizAnswered}
							class:bg-green-100={quizAnswered && isCorrect}
							class:text-success={quizAnswered && isCorrect}
							class:border-success={quizAnswered && isCorrect}
							class:bg-red-100={quizAnswered && isChosen && !isCorrect}
							class:text-alert={quizAnswered && isChosen && !isCorrect}
							class:border-alert={quizAnswered && isChosen && !isCorrect}
						>
							{opt}
						</button>
					{/each}
				</div>

				{#if quizAnswered}
					<div class="flex justify-end pt-2">
						<button
							type="button"
							onclick={advanceQuiz}
							class="mech-btn px-5 py-2 font-display text-sm font-bold bg-action text-white hover:bg-blue-700 cursor-pointer inline-flex items-center gap-1.5"
						>
							<span>{quizIndex + 1 >= currentWordList.length ? t().matrix.finishTest : t().common.next}</span>
							<span aria-hidden="true">→</span>
						</button>
					</div>
				{/if}
			{/if}
		</div>

	{:else if currentMode === "match"}
		<!-- Match Mode (Speed Pairing Tile Game) -->
		<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
			<div class="flex items-center justify-between text-xs font-mono text-ink-muted">
				<span class="data-pill px-2.5 py-1 font-bold">
					{t().matrix.matchPrompt}
				</span>
				<span class="tabular-nums font-bold">
					{matchTimerSeconds.toFixed(1)}s
				</span>
			</div>

			{#if matchGameCompleted}
				<div class="mech-card p-8 flex flex-col items-center gap-4 text-center">
					<span class="data-pill px-3 py-1 text-sm font-bold bg-success text-white">
						{t().common.valid}
					</span>
					<h3 class="font-display text-2xl font-bold text-ink">
						{t().matrix.matchComplete} {matchTimerSeconds.toFixed(1)} {t().matrix.seconds}
					</h3>
					<button
						type="button"
						onclick={initMatch}
						class="mech-btn px-6 py-2.5 font-display text-sm font-bold bg-action text-white hover:bg-blue-700 cursor-pointer mt-2"
					>
						{t().matrix.playAgain}
					</button>
				</div>
			{:else}
				<!-- Tiles Grid -->
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{#each matchTiles as tile, idx (tile.id)}
						{@const isSelected = selectedTileA === idx || selectedTileB === idx}
						<button
							type="button"
							disabled={tile.matched}
							onclick={() => handleTileClick(idx)}
							class="mech-card min-h-[90px] p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none disabled:opacity-20 disabled:cursor-default"
							class:bg-card={!isSelected && !tile.matched}
							class:ring-2={isSelected}
							class:ring-action={isSelected && !mismatchFlash}
							class:ring-alert={isSelected && mismatchFlash}
							class:bg-red-50={isSelected && mismatchFlash}
							class:bg-action-50={isSelected && !mismatchFlash}
						>
							{#if tile.type === "hanzi"}
								<span class="font-hanzi text-2xl font-bold text-ink">
									{tile.text}
								</span>
							{:else}
								<span class="font-sans text-xs font-bold text-ink-muted">
									{tile.text}
								</span>
							{/if}
						</button>
					{/each}
				</div>

				<div class="flex justify-center pt-2">
					<button
						type="button"
						onclick={initMatch}
						class="mech-btn px-4 py-1.5 font-display text-xs font-bold text-ink-muted hover:text-ink cursor-pointer"
					>
						{t().matrix.playAgain}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
