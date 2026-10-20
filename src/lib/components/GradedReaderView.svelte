<script lang="ts">
	import CharacterPopover from "#lib/components/CharacterPopover.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { gradedReader } from "#lib/state/graded-reader.svelte";

	let passage = $derived(gradedReader.currentPassage);
	let popover = $derived(gradedReader.selectedCharacter);

	function isPunctuation(char: string): boolean {
		return "，。！？、；：“”‘’（）《》".includes(char);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && popover) {
			gradedReader.closePopover();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={`${passage.titleHanzi} ${passage.titlePinyin}`}
		subtitle={i18n.current === "es" ? passage.titleEs : passage.titleEn}
	>
		<span class="data-pill px-2.5 py-1 text-xs font-bold text-ink bg-paper font-mono tabular-nums">
			{passage.level}
		</span>
		<span class="data-pill px-2.5 py-1 text-xs font-mono text-ink-muted tabular-nums">
			{gradedReader.currentPassageIndex + 1} / {gradedReader.passages.length}
		</span>
	</SectionHeader>

	<!-- Audio and Display Controls Bar -->
	<div class="mech-card p-3 flex flex-wrap items-center justify-between gap-3 bg-panel">
		<div class="flex items-center gap-2" role="group" aria-label={t().reader.speed}>
			<span class="font-display text-xs font-bold uppercase tracking-wide text-ink-muted mr-1">
				{t().reader.speed}:
			</span>
			<button
				type="button"
				class="data-pill px-2.5 py-1 text-xs font-bold cursor-pointer"
				class:bg-card={gradedReader.playbackSpeed === 0.75}
				aria-pressed={gradedReader.playbackSpeed === 0.75}
				onclick={() => gradedReader.setSpeed(0.75)}
			>
				0.75x
			</button>
			<button
				type="button"
				class="data-pill px-2.5 py-1 text-xs font-bold cursor-pointer"
				class:bg-card={gradedReader.playbackSpeed === 1.0}
				aria-pressed={gradedReader.playbackSpeed === 1.0}
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
				aria-pressed={gradedReader.showPinyin}
			>
				{gradedReader.showPinyin
					? t().reader.hidePinyin
					: t().reader.showPinyin}
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
				class="p-4 rounded-xs border transition-colors flex flex-col gap-2"
				class:bg-paper={gradedReader.activeSentenceId === sentence.id}
				class:border-action={gradedReader.activeSentenceId === sentence.id}
				class:border-transparent={gradedReader.activeSentenceId !== sentence.id}
				aria-current={gradedReader.activeSentenceId === sentence.id ? "true" : undefined}
			>
				<!-- Characters flow -->
				<div class="flex flex-wrap items-baseline gap-x-1 gap-y-3 leading-relaxed">
					{#each Array.from(sentence.hanzi) as char, index (`${sentence.id}_${index}_${char}`)}
						{#if isPunctuation(char)}
							<span class="font-hanzi text-2xl md:text-3xl font-bold text-ink">
								{char}
							</span>
						{:else}
							<button
								type="button"
								onclick={() => gradedReader.selectCharacter(char)}
								class="flex flex-col items-center group cursor-pointer hover:bg-panel transition-colors p-0.5 rounded-xs"
								aria-label="{t().reader.characterLookup}: {char}"
							>
								{#if gradedReader.showPinyin}
									<span class="font-mono text-xs text-ink-muted">
										{sentence.pinyin.split(" ")[index] ?? ""}
									</span>
								{/if}
								<span class="font-hanzi text-2xl md:text-3xl font-bold text-ink group-hover:underline">
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
						aria-label={t().reader.playSentence}
					>
						{#if gradedReader.activeSentenceId === sentence.id}
							<span>…</span>
						{:else}
							<span aria-hidden="true">&#9658;</span>
						{/if}
					</button>
				</div>

				<!-- Bilingual Sentence Subtitle -->
				{#if gradedReader.showPinyin}
					<p class="font-mono text-xs text-tone-2 pt-1">
						{sentence.pinyin}
					</p>
					<p class="font-sans text-xs text-ink-muted">
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
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
		>
			<span aria-hidden="true">&larr;</span>
			<span>{t().reader.previousPassage}</span>
		</button>
		<button
			type="button"
			disabled={gradedReader.currentPassageIndex === gradedReader.passages.length - 1}
			onclick={() => gradedReader.nextPassage()}
			class="mech-btn px-4 py-2 font-display text-sm font-bold disabled:opacity-30 cursor-pointer inline-flex items-center gap-1.5"
		>
			<span>{t().reader.nextPassage}</span>
			<span aria-hidden="true">&rarr;</span>
		</button>
	</div>
</div>
