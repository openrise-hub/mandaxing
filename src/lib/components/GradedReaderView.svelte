<script lang="ts">
	import CharacterPopover from "#lib/components/CharacterPopover.svelte";
	import { i18n } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import { gradedReader } from "#lib/state/graded-reader.svelte";

	let passage = $derived(gradedReader.currentPassage);
	let popover = $derived(gradedReader.selectedCharacter);

	function isPunctuation(char: string): boolean {
		return "，。！？、；：“”‘’（）《》".includes(char);
	}
</script>

<div class="relative w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<!-- Top Bar with Return Navigation -->
	<div class="flex items-center justify-between border-b-2 border-[var(--color-ink)]/15 pb-4">
		<div>
			<div class="flex items-center gap-2">
				<span class="data-pill px-2 py-0.5 text-xs font-bold text-[var(--color-ink)] bg-[var(--color-paper)]">
					{passage.level}
				</span>
				<span class="font-mono text-xs text-[var(--color-ink-muted)]">
					{gradedReader.currentPassageIndex + 1} / {gradedReader.passages.length}
				</span>
			</div>
			<h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)] mt-1">
				{passage.titleHanzi}
				<span class="font-mono text-base font-normal text-[var(--color-ink-muted)] ml-2">
					{passage.titlePinyin}
				</span>
			</h1>
			<p class="font-sans text-xs text-[var(--color-ink-muted)] mt-0.5">
				{i18n.current === "es" ? passage.titleEs : passage.titleEn}
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

	<!-- Audio and Display Controls Bar -->
	<div class="mech-card p-3 flex flex-wrap items-center justify-between gap-3 bg-[var(--color-panel)]">
		<div class="flex items-center gap-2">
			<span class="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)] mr-1">
				{i18n.current === "es" ? "Velocidad" : "Speed"}:
			</span>
			<button
				type="button"
				class="data-pill px-2.5 py-1 text-xs font-bold cursor-pointer"
				class:bg-[var(--color-card)]={gradedReader.playbackSpeed === 0.75}
				onclick={() => gradedReader.setSpeed(0.75)}
			>
				0.75x
			</button>
			<button
				type="button"
				class="data-pill px-2.5 py-1 text-xs font-bold cursor-pointer"
				class:bg-[var(--color-card)]={gradedReader.playbackSpeed === 1.0}
				onclick={() => gradedReader.setSpeed(1.0)}
			>
				1.0x
			</button>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => gradedReader.togglePinyin()}
				class="mech-btn px-3 py-1 font-mono text-xs font-bold cursor-pointer"
			>
				{gradedReader.showPinyin
					? (i18n.current === "es" ? "Ocultar Pinyin" : "Hide Pinyin")
					: (i18n.current === "es" ? "Mostrar Pinyin" : "Show Pinyin")}
			</button>
		</div>
	</div>

	<!-- Reading Text Canvas -->
	<article class="mech-card p-6 md:p-8 flex flex-col gap-6 bg-white relative">
		{#if popover}
			<div class="absolute top-4 right-4 md:right-8 z-30">
				<CharacterPopover lookup={popover} />
			</div>
		{/if}

		{#each passage.sentences as sentence (sentence.id)}
			<div
				class="p-4 rounded-sm border transition-colors flex flex-col gap-2"
				class:bg-[var(--color-paper)]={gradedReader.activeSentenceId === sentence.id}
				class:border-[var(--color-action)]={gradedReader.activeSentenceId === sentence.id}
				class:border-transparent={gradedReader.activeSentenceId !== sentence.id}
			>
				<!-- Characters flow -->
				<div class="flex flex-wrap items-baseline gap-x-1 gap-y-3 leading-relaxed">
					{#each Array.from(sentence.hanzi) as char, index (`${sentence.id}_${index}_${char}`)}
						{#if isPunctuation(char)}
							<span class="font-hanzi text-2xl md:text-3xl font-bold text-[var(--color-ink)]">
								{char}
							</span>
						{:else}
							<button
								type="button"
								onclick={() => gradedReader.selectCharacter(char)}
								class="flex flex-col items-center group cursor-pointer hover:text-[var(--color-action)] transition-colors p-0.5 rounded-xs"
								title="Click to view definition"
							>
								{#if gradedReader.showPinyin}
									<span class="font-mono text-xs text-[var(--color-ink-muted)] group-hover:text-[var(--color-action)]">
										{sentence.pinyin.split(" ")[index] ?? ""}
									</span>
								{/if}
								<span class="font-hanzi text-2xl md:text-3xl font-bold text-[var(--color-ink)] group-hover:text-[var(--color-action)] group-hover:underline">
									{char}
								</span>
							</button>
						{/if}
					{/each}

					<!-- Audio Play Trigger for Sentence -->
					<button
						type="button"
						disabled={gradedReader.isPlaying}
						onclick={() => void gradedReader.playSentence(sentence)}
						class="mech-btn ml-2 px-2 py-0.5 text-xs font-mono inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
						aria-label="Play sentence audio"
					>
						{#if gradedReader.activeSentenceId === sentence.id}
							<span>...</span>
						{:else}
							<span aria-hidden="true">&#9658;</span>
						{/if}
					</button>
				</div>

				<!-- Bilingual Sentence Subtitle -->
				{#if gradedReader.showPinyin}
					<p class="font-mono text-xs text-[var(--color-tone-2)] pt-1">
						{sentence.pinyin}
					</p>
					<p class="font-sans text-xs text-[var(--color-ink-muted)]">
						{i18n.current === "es" ? sentence.es : sentence.en}
					</p>
				{/if}
			</div>
		{/each}
	</article>

	<!-- Passage Step Navigation -->
	<div class="flex items-center justify-between pt-2">
		<button
			type="button"
			disabled={gradedReader.currentPassageIndex === 0}
			onclick={() => gradedReader.previousPassage()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer"
		>
			&larr; {i18n.current === "es" ? "Texto Anterior" : "Previous Passage"}
		</button>
		<button
			type="button"
			disabled={gradedReader.currentPassageIndex === gradedReader.passages.length - 1}
			onclick={() => gradedReader.nextPassage()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer"
		>
			{i18n.current === "es" ? "Siguiente Texto" : "Next Passage"} &rarr;
		</button>
	</div>
</div>
