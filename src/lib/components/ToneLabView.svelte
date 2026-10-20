<script lang="ts">
	import ControlPanel from "#lib/components/ControlPanel.svelte";
	import EarTrainingPad from "#lib/components/EarTrainingPad.svelte";
	import PitchCanvas from "#lib/components/PitchCanvas.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import StimulusCard from "#lib/components/StimulusCard.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { lab } from "#lib/state/tone-lab.svelte";

	type ViewMode = "dictionary" | "listen-pick" | "speak-match";

	let viewMode = $state<ViewMode>("dictionary");
	let selectedToneFilter = $state<number | null>(null);

	const toneKeys = {
		0: "neutral",
		1: "tone1",
		2: "tone2",
		3: "tone3",
		4: "tone4",
	} as const;

	const modes = [
		{ key: "single", label: "singleTones" },
		{ key: "pairs", label: "tonePairs" },
		{ key: "minimal", label: "minimalPairs" },
	] as const;

	let current = $derived(lab.currentStimulus);
	let busy = $derived(lab.status === "loading" || lab.status === "evaluating");
	let canUse = $derived(
		Boolean(current) && !lab.currentUnavailable && lab.status !== "offline",
	);
	let blindBusy = $derived(
		lab.status === "loading" || lab.status === "playing",
	);

	let filteredList = $derived.by(() => {
		const filter = selectedToneFilter;
		if (filter === null) return lab.list;
		return lab.list.filter((item) => item.tones.includes(filter));
	});

	$effect(() => {
		void lab.mode;
		selectedToneFilter = null;
	});

	function toggleToneFilter(tone: number): void {
		selectedToneFilter = selectedToneFilter === tone ? null : tone;
	}

	function translationFor(stimulus = current): string {
		if (!stimulus) return "";
		if (stimulus.en === "" && stimulus.tones?.length === 1) {
			const key = toneKeys[(stimulus.tones[0] ?? 0) as keyof typeof toneKeys];
			const tone = t().toneLab.tones[key];
			return `${tone.name}: ${tone.description}`;
		}
		return i18n.locale === "es" ? stimulus.es : stimulus.en;
	}

	function startListenPick(): void {
		viewMode = "listen-pick";
		void lab.playBlindPrompt();
	}

	function startSpeakMatch(): void {
		viewMode = "speak-match";
	}
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	{#if viewMode === "dictionary"}
		<SectionHeader title={t().toneLab.title} subtitle={t().toneLab.subtitle}>
			{#each modes as mode (mode.key)}
				<button
					type="button"
					class="data-pill px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
					class:bg-card={lab.mode === mode.key}
					class:text-ink={lab.mode === mode.key}
					class:shadow-[2px_2px_0px_#1E1B18]={lab.mode === mode.key}
					aria-pressed={lab.mode === mode.key}
					onclick={() => lab.setMode(mode.key)}
				>
					{t().navigation[mode.label]}
				</button>
			{/each}
		</SectionHeader>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<button
				type="button"
				onclick={startListenPick}
				class="mech-btn p-5 text-left flex flex-col gap-2 cursor-pointer group bg-card"
			>
				<div class="flex items-center justify-between">
					<span class="data-pill px-2.5 py-1 text-xs font-bold bg-tone-1 text-card">
						{t().toneLab.listeningPadTitle}
					</span>
					<span class="font-display text-sm font-bold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
						→
					</span>
				</div>
				<h2 class="font-display text-xl font-bold text-ink">
					{t().toneLab.listenAndPick}
				</h2>
				<p class="font-sans text-xs text-ink-muted">
					{t().toneLab.listenAndPickDesc}
				</p>
			</button>

			<button
				type="button"
				onclick={startSpeakMatch}
				class="mech-btn p-5 text-left flex flex-col gap-2 cursor-pointer group bg-card"
			>
				<div class="flex items-center justify-between">
					<span class="data-pill px-2.5 py-1 text-xs font-bold bg-action text-white">
						{t().common.appName}
					</span>
					<span class="font-display text-sm font-bold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
						→
					</span>
				</div>
				<h2 class="font-display text-xl font-bold text-ink">
					{t().toneLab.speakAndMatch}
				</h2>
				<p class="font-sans text-xs text-ink-muted">
					{t().toneLab.speakAndMatchDesc}
				</p>
			</button>
		</div>

		{#if lab.mode === "single"}
			<div class="mech-card p-5 flex flex-col gap-4 bg-card">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<div class="flex h-3 w-8 overflow-hidden rounded-xs border border-ink/40">
							<span class="w-1/4 bg-tone-1"></span>
							<span class="w-1/4 bg-tone-2"></span>
							<span class="w-1/4 bg-tone-3"></span>
							<span class="w-1/4 bg-tone-4"></span>
						</div>
						<h3 class="font-display text-base font-bold text-ink">
							{t().toneLab.toneGuideTitle}
						</h3>
					</div>
					<p class="font-sans text-xs text-ink-muted">
						{t().toneLab.toneGuideSubtitle}
					</p>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
					<button
						type="button"
						class="mech-btn p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-all border-l-4"
						style="border-left-color: var(--color-tone-1);"
						class:ring-2={selectedToneFilter === 1}
						class:ring-action={selectedToneFilter === 1}
						onclick={() => toggleToneFilter(1)}
					>
						<div class="flex items-center justify-between">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold" style="background-color: var(--color-tone-1);">
								T1
							</span>
							<span class="font-mono text-base font-bold text-tone-1">¯</span>
						</div>
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.tones.tone1.name} · {t().toneLab.pitchShapes.tone1}
						</div>
						<div class="font-sans text-[11px] text-ink-muted leading-tight">
							{t().toneLab.tone1Cue}
						</div>
					</button>

					<button
						type="button"
						class="mech-btn p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-all border-l-4"
						style="border-left-color: var(--color-tone-2);"
						class:ring-2={selectedToneFilter === 2}
						class:ring-action={selectedToneFilter === 2}
						onclick={() => toggleToneFilter(2)}
					>
						<div class="flex items-center justify-between">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold" style="background-color: var(--color-tone-2);">
								T2
							</span>
							<span class="font-mono text-base font-bold text-tone-2">´</span>
						</div>
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.tones.tone2.name} · {t().toneLab.pitchShapes.tone2}
						</div>
						<div class="font-sans text-[11px] text-ink-muted leading-tight">
							{t().toneLab.tone2Cue}
						</div>
					</button>

					<button
						type="button"
						class="mech-btn p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-all border-l-4"
						style="border-left-color: var(--color-tone-3);"
						class:ring-2={selectedToneFilter === 3}
						class:ring-action={selectedToneFilter === 3}
						onclick={() => toggleToneFilter(3)}
					>
						<div class="flex items-center justify-between">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold" style="background-color: var(--color-tone-3);">
								T3
							</span>
							<span class="font-mono text-base font-bold text-tone-3">ˇ</span>
						</div>
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.tones.tone3.name} · {t().toneLab.pitchShapes.tone3}
						</div>
						<div class="font-sans text-[11px] text-ink-muted leading-tight">
							{t().toneLab.tone3Cue}
						</div>
					</button>

					<button
						type="button"
						class="mech-btn p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-all border-l-4"
						style="border-left-color: var(--color-tone-4);"
						class:ring-2={selectedToneFilter === 4}
						class:ring-action={selectedToneFilter === 4}
						onclick={() => toggleToneFilter(4)}
					>
						<div class="flex items-center justify-between">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold" style="background-color: var(--color-tone-4);">
								T4
							</span>
							<span class="font-mono text-base font-bold text-tone-4">`</span>
						</div>
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.tones.tone4.name} · {t().toneLab.pitchShapes.tone4}
						</div>
						<div class="font-sans text-[11px] text-ink-muted leading-tight">
							{t().toneLab.tone4Cue}
						</div>
					</button>

					<button
						type="button"
						class="mech-btn p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-all border-l-4"
						style="border-left-color: var(--color-tone-neutral);"
						class:ring-2={selectedToneFilter === 0}
						class:ring-action={selectedToneFilter === 0}
						onclick={() => toggleToneFilter(0)}
					>
						<div class="flex items-center justify-between">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold" style="background-color: var(--color-tone-neutral);">
								T0
							</span>
							<span class="font-mono text-base font-bold text-ink-muted">·</span>
						</div>
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.tones.neutral.name} · {t().toneLab.pitchShapes.neutral}
						</div>
						<div class="font-sans text-[11px] text-ink-muted leading-tight">
							{t().toneLab.neutralCue}
						</div>
					</button>
				</div>
			</div>
		{/if}

		<div class="mech-card overflow-hidden">
			<div class="p-4 border-b border-ink/15 bg-panel flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<h2 class="font-display text-sm font-bold tracking-wider text-ink">
						{t().toneLab.dictionaryTab}
					</h2>
					{#if lab.mode === "single"}
						<button
							type="button"
							class="data-pill px-2.5 py-0.5 text-xs font-bold cursor-pointer transition-all"
							class:bg-card={selectedToneFilter === null}
							class:text-ink={selectedToneFilter === null}
							class:shadow-[1px_1px_0px_#1E1B18]={selectedToneFilter === null}
							onclick={() => { selectedToneFilter = null; }}
						>
							{t().toneLab.allTones}
						</button>
					{/if}
				</div>
				<span class="font-mono text-xs text-ink-muted tabular-nums">
					{filteredList.length} {t().toneLab.syllablesCount}
				</span>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse" aria-label={t().toneLab.dictionaryTab}>
					<thead>
						<tr class="border-b border-ink bg-panel/60 font-display text-xs tracking-wider text-ink">
							{#if lab.mode === "minimal"}
								<th scope="col" class="py-3 px-4">{t().toneLab.contrastColumn}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.pinyin}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.character}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.meaning}</th>
								<th scope="col" class="py-3 px-4 text-right">{t().matrix.audio}</th>
							{:else if lab.mode === "pairs"}
								<th scope="col" class="py-3 px-4">{t().matrix.pinyin}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.character}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.meaning}</th>
								<th scope="col" class="py-3 px-4 text-center">{t().toneLab.toneColumn}</th>
								<th scope="col" class="py-3 px-4 text-right">{t().matrix.audio}</th>
							{:else}
								<th scope="col" class="py-3 px-4">{t().toneLab.syllableColumn}</th>
								<th scope="col" class="py-3 px-4 text-center">{t().toneLab.toneColumn}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.meaning}</th>
								<th scope="col" class="py-3 px-4 text-right">{t().matrix.audio}</th>
							{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-ink/15">
						{#each filteredList as item (item.id)}
							<tr class="hover:bg-panel/40 transition-colors">
								{#if lab.mode === "minimal"}
									<td class="py-3 px-4 font-mono text-sm font-bold text-ink">
										{item.label}
									</td>
									<td class="py-3 px-4 font-mono text-base font-bold text-ink">
										{item.pinyin}
									</td>
									<td class="py-3 px-4 font-hanzi text-xl font-bold text-ink">
										{item.hanzi}
									</td>
									<td class="py-3 px-4 font-sans text-xs text-ink-muted">
										{translationFor(item)}
									</td>
									<td class="py-3 px-4 text-right">
										<button
											type="button"
											onclick={() => {
												lab.selectStimulusById(item.id);
												void lab.play();
											}}
											class="mech-btn px-2.5 py-1 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
											aria-label="{t().common.playAudio}: {item.pinyin}"
										>
											<span aria-hidden="true">▶</span>
										</button>
									</td>
								{:else if lab.mode === "pairs"}
									<td class="py-3 px-4 font-mono text-base font-bold text-ink">
										{item.pinyin}
									</td>
									<td class="py-3 px-4 font-hanzi text-xl font-bold text-ink">
										{item.hanzi}
									</td>
									<td class="py-3 px-4 font-sans text-xs text-ink-muted">
										{translationFor(item)}
									</td>
									<td class="py-3 px-4 text-center">
										{#each item.tones as tone}
											<span
												class="data-pill px-2 py-0.5 text-xs text-card font-bold mr-1"
												style="background-color: var(--color-tone-{tone});"
											>
												T{tone}
											</span>
										{/each}
									</td>
									<td class="py-3 px-4 text-right">
										<button
											type="button"
											onclick={() => {
												lab.selectStimulusById(item.id);
												void lab.play();
											}}
											class="mech-btn px-2.5 py-1 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
											aria-label="{t().common.playAudio}: {item.pinyin}"
										>
											<span aria-hidden="true">▶</span>
										</button>
									</td>
								{:else}
									<td class="py-3 px-4 font-mono text-lg font-bold text-ink">
										{item.pinyin}
									</td>
									<td class="py-3 px-4 text-center">
										{#each item.tones as tone}
											<span
												class="data-pill px-2.5 py-0.5 text-xs text-card font-bold"
												style="background-color: var(--color-tone-{tone});"
											>
												T{tone}
											</span>
										{/each}
									</td>
									<td class="py-3 px-4 font-sans text-xs text-ink-muted">
										{translationFor(item)}
									</td>
									<td class="py-3 px-4 text-right">
										<button
											type="button"
											onclick={() => {
												lab.selectStimulusById(item.id);
												void lab.play();
											}}
											class="mech-btn px-2.5 py-1 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
											aria-label="{t().common.playAudio}: {item.pinyin}"
										>
											<span aria-hidden="true">▶</span>
										</button>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	{:else if viewMode === "listen-pick"}
		<SectionHeader
			title={t().toneLab.listenAndPick}
			subtitle={t().toneLab.listenAndPickDesc}
			backLabel={t().toneLab.backToDictionary}
			onBack={() => { viewMode = "dictionary"; }}
		/>

		<div class="mx-auto flex w-full max-w-xl flex-col gap-6">
			<section class="mech-card p-6 flex flex-col items-center gap-5 text-center">
				<h2 class="sr-only">Ear Training</h2>
				<button
					type="button"
					class="mech-btn px-6 py-4 font-display text-lg font-bold disabled:opacity-40 cursor-pointer inline-flex items-center gap-2"
					disabled={blindBusy}
					onclick={() => void lab.playBlindPrompt()}
				>
					<span aria-hidden="true">▶</span>
					<span>{t().toneLab.playReference}</span>
				</button>

				<div role="status" aria-live="polite" class="min-h-[28px] flex items-center justify-center">
					{#if lab.blindFeedback !== "idle"}
						<span
							class="data-pill px-3 py-1 text-sm text-card font-bold"
							class:bg-success={lab.blindFeedback === "correct"}
							class:bg-alert={lab.blindFeedback === "incorrect"}
						>
							{lab.blindFeedback === "correct"
								? t().common.valid
								: t().common.retry}
						</span>
					{/if}
				</div>

				<div class="w-full pt-2">
					<EarTrainingPad
						disabled={lab.blindTarget === null || blindBusy || lab.blindFeedback !== "idle"}
						onSelect={(tone) => void lab.answerBlindTone(tone)}
					/>
				</div>
			</section>

			<div class="flex items-center justify-between">
				<button
					type="button"
					class="mech-btn px-4 py-2 font-display text-sm font-bold cursor-pointer"
					onclick={() => { viewMode = "dictionary"; }}
				>
					← {t().toneLab.backToDictionary}
				</button>
				<button
					type="button"
					class="mech-btn px-4 py-2 font-display text-sm font-bold cursor-pointer"
					onclick={() => void lab.playBlindPrompt()}
				>
					{t().common.next} →
				</button>
			</div>
		</div>

	{:else if viewMode === "speak-match"}
		<SectionHeader
			title={t().toneLab.speakAndMatch}
			subtitle={t().toneLab.speakAndMatchDesc}
			backLabel={t().toneLab.backToDictionary}
			onBack={() => { viewMode = "dictionary"; }}
		/>

		<div class="grid items-start gap-6 lg:grid-cols-2">
			<div class="flex flex-col gap-4">
				<StimulusCard
					pinyin={current?.pinyin ?? ""}
					hanzi={current?.hanzi}
					translation={translationFor()}
					tones={current?.tones ?? []}
					label={current?.label}
				/>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="mech-btn px-4 py-1.5 text-sm font-display font-bold cursor-pointer"
						onclick={() => lab.setIndex(-1)}
					>
						{t().common.previous}
					</button>
					<button
						type="button"
						class="mech-btn px-4 py-1.5 text-sm font-display font-bold cursor-pointer"
						onclick={() => lab.setIndex(1)}
					>
						{t().common.next}
					</button>
				</div>
				<ControlPanel
					{busy}
					recording={lab.status === "recording"}
					{canUse}
					unavailable={lab.currentUnavailable}
					offline={lab.status === "offline"}
					onListen={() => void lab.play()}
					onRecord={() => void lab.startRecording()}
					onStop={() => void lab.stopRecording()}
					result={lab.result}
				/>
			</div>

			<div class="flex flex-col gap-4 lg:sticky lg:top-6">
				{#if lab.currentUnavailable || lab.status === "offline"}
					<p class="mech-card p-4 text-sm">
						{lab.currentUnavailable
							? t().common.audioUnavailable
							: t().common.offline}
					</p>
				{:else}
					<PitchCanvas
						reference={lab.reference}
						user={lab.user}
						highlightTones={current?.tones ?? []}
					/>
				{/if}
			</div>
		</div>
	{/if}
</div>
