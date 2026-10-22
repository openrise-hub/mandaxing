<script lang="ts">
	import ControlPanel from "#lib/components/ControlPanel.svelte";
	import EarTrainingPad from "#lib/components/EarTrainingPad.svelte";
	import PitchCanvas from "#lib/components/PitchCanvas.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import StimulusCard from "#lib/components/StimulusCard.svelte";
	import isolatedTones from "#lib/data/isolated-tones.json";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { lab } from "#lib/state/tone-lab.svelte";
	import type { IsolatedToneItem } from "#lib/types/catalogs";

	type ViewMode = "dictionary" | "listen-pick" | "speak-match";

	const baseSyllables = isolatedTones as IsolatedToneItem[];

	interface InitialGroup {
		key: string;
		label: string;
		test: (syllable: string) => boolean;
	}

	const initialGroups: InitialGroup[] = [
		{ key: "all", label: "allInitials", test: () => true },
		{ key: "bpmf", label: "b, p, m, f", test: (s) => /^(b|p|m|f)/.test(s) },
		{ key: "dtnl", label: "d, t, n, l", test: (s) => /^(d|t|n|l)/.test(s) },
		{ key: "gkh", label: "g, k, h", test: (s) => /^(g|k|h)/.test(s) },
		{ key: "jqx", label: "j, q, x", test: (s) => /^(j|q|x)/.test(s) },
		{ key: "zhchshr", label: "zh, ch, sh, r", test: (s) => /^(zh|ch|sh|r)/.test(s) },
		{ key: "zcs", label: "z, c, s", test: (s) => /^(z(?!h)|c(?!h)|s(?!h))/.test(s) },
		{ key: "vowels", label: "a, o, e... / w, y", test: (s) => /^(a|o|e|w|y)/.test(s) },
	];

	let viewMode = $state<ViewMode>("dictionary");
	let selectedToneFilter = $state<number | null>(null);
	let selectedInitialGroup = $state("all");
	let selectedPairStartFilter = $state<number | null>(null);
	let selectedMinimalCategoryFilter = $state("all");
	let searchQuery = $state("");
	let currentPage = $state(1);
	const singlePageSize = 25;

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

	function getMinimalCategory(contrast: string): string {
		if (/^(b vs p|d vs t|g vs k|zh vs ch|z vs c|j vs q)/.test(contrast)) {
			return "aspiration";
		}
		if (/^(zh vs z|ch vs c|sh vs s)/.test(contrast)) {
			return "sibilants";
		}
		if (/^(x vs sh|f vs h|n vs l|l vs r|q vs x|j vs zh)/.test(contrast)) {
			return "palatals";
		}
		if (
			/^(an vs ang|en vs eng|in vs ing|ian vs iang|uan vs uang)/.test(contrast)
		) {
			return "finals";
		}
		if (/^T\d vs T\d/.test(contrast)) {
			return "tones";
		}
		return "other";
	}

	let filteredSingleSyllables = $derived.by(() => {
		let list = baseSyllables;
		const activeGroup = initialGroups.find((g) => g.key === selectedInitialGroup);
		if (activeGroup && activeGroup.key !== "all") {
			list = list.filter((item) => activeGroup.test(item.syllable));
		}
		const toneFilter = selectedToneFilter;
		if (toneFilter !== null) {
			list = list.filter((item) => item.tones.some((t) => t.tone === toneFilter));
		}
		if (searchQuery.trim() !== "") {
			const q = searchQuery.trim().toLowerCase();
			list = list.filter(
				(item) =>
					item.syllable.toLowerCase().includes(q) ||
					item.tones.some((t) => t.pinyin.toLowerCase().includes(q)),
			);
		}
		return list;
	});

	let totalSinglePages = $derived(
		Math.max(1, Math.ceil(filteredSingleSyllables.length / singlePageSize)),
	);
	let paginatedSingleSyllables = $derived.by(() => {
		const start = (currentPage - 1) * singlePageSize;
		return filteredSingleSyllables.slice(start, start + singlePageSize);
	});

	let filteredPairsList = $derived.by(() => {
		let list = lab.list;
		if (lab.mode === "pairs" && selectedPairStartFilter !== null) {
			list = list.filter((item) => {
				const startTone = item.label === "3+3" ? 3 : (item.tones[0] ?? 0);
				return startTone === selectedPairStartFilter;
			});
		}
		if (lab.mode === "minimal" && selectedMinimalCategoryFilter !== "all") {
			list = list.filter(
				(item) =>
					item.label &&
					getMinimalCategory(item.label) === selectedMinimalCategoryFilter,
			);
		}
		if (searchQuery.trim() !== "") {
			const q = searchQuery.trim().toLowerCase();
			list = list.filter(
				(item) =>
					item.pinyin.toLowerCase().includes(q) ||
					item.syllables.some((s) => s.syllable.toLowerCase().includes(q)) ||
					(item.hanzi && item.hanzi.includes(q)) ||
					(item.label && item.label.toLowerCase().includes(q)) ||
					(item.itemA &&
						(item.itemA.pinyin.toLowerCase().includes(q) ||
							item.itemA.hanzi.includes(q) ||
							item.itemA.en.toLowerCase().includes(q) ||
							item.itemA.es.toLowerCase().includes(q))) ||
					(item.itemB &&
						(item.itemB.pinyin.toLowerCase().includes(q) ||
							item.itemB.hanzi.includes(q) ||
							item.itemB.en.toLowerCase().includes(q) ||
							item.itemB.es.toLowerCase().includes(q))),
			);
		}
		return list;
	});

	$effect(() => {
		void lab.mode;
		selectedToneFilter = null;
		selectedInitialGroup = "all";
		selectedPairStartFilter = null;
		selectedMinimalCategoryFilter = "all";
		searchQuery = "";
		currentPage = 1;
	});

	$effect(() => {
		void selectedToneFilter;
		void selectedInitialGroup;
		void selectedPairStartFilter;
		void selectedMinimalCategoryFilter;
		void searchQuery;
		currentPage = 1;
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

{#snippet toneContourSvg(tone: number, className: string = "w-8 h-5")}
	{#if tone === 1}
		<svg class={className} viewBox="0 0 32 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
			<line x1="4" y1="5" x2="28" y2="5" />
		</svg>
	{:else if tone === 2}
		<svg class={className} viewBox="0 0 32 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
			<line x1="4" y1="15" x2="28" y2="5" />
		</svg>
	{:else if tone === 3}
		<svg class={className} viewBox="0 0 32 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 8 L14 16 L28 4" />
		</svg>
	{:else if tone === 4}
		<svg class={className} viewBox="0 0 32 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
			<line x1="4" y1="5" x2="28" y2="15" />
		</svg>
	{:else}
		<svg class={className} viewBox="0 0 32 20" fill="currentColor" aria-hidden="true">
			<circle cx="16" cy="10" r="3.5" />
		</svg>
	{/if}
{/snippet}

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
							{@render toneContourSvg(1, "w-8 h-5 text-tone-1")}
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
							{@render toneContourSvg(2, "w-8 h-5 text-tone-2")}
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
							{@render toneContourSvg(3, "w-8 h-5 text-tone-3")}
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
							{@render toneContourSvg(4, "w-8 h-5 text-tone-4")}
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
							{@render toneContourSvg(0, "w-8 h-5 text-ink-muted")}
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

		{#if lab.mode === "pairs"}
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
							{t().toneLab.pairsGuideTitle}
						</h3>
					</div>
					<p class="font-sans text-xs text-ink-muted">
						{t().toneLab.pairsGuideSubtitle}
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div class="mech-card p-3.5 flex flex-col gap-1.5 border-l-4" style="border-left-color: var(--color-tone-3);">
						<div class="font-display text-xs font-bold text-ink flex items-center gap-2">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold bg-tone-3">3 + 3</span>
							<span>{t().toneLab.pairsGuideSandhiTitle}</span>
						</div>
						<p class="font-sans text-xs text-ink-muted leading-relaxed">
							{t().toneLab.pairsGuideSandhiDesc}
						</p>
					</div>

					<div class="mech-card p-3.5 flex flex-col gap-1.5 border-l-4" style="border-left-color: var(--color-tone-neutral);">
						<div class="font-display text-xs font-bold text-ink flex items-center gap-2">
							<span class="data-pill px-2 py-0.5 text-xs text-card font-bold bg-ink-muted">T0</span>
							<span>{t().toneLab.pairsGuideNeutralTitle}</span>
						</div>
						<p class="font-sans text-xs text-ink-muted leading-relaxed">
							{t().toneLab.pairsGuideNeutralDesc}
						</p>
					</div>
				</div>
			</div>
		{/if}

		{#if lab.mode === "minimal"}
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
							{t().toneLab.minimalGuideTitle}
						</h3>
					</div>
					<p class="font-sans text-xs text-ink-muted">
						{t().toneLab.minimalGuideSubtitle}
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div class="mech-card p-3 flex flex-col gap-1.5 border-l-4" style="border-left-color: var(--color-tone-1);">
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.minimalGuideAspirationTitle}
						</div>
						<p class="font-sans text-[11px] text-ink-muted leading-relaxed">
							{t().toneLab.minimalGuideAspirationDesc}
						</p>
					</div>

					<div class="mech-card p-3 flex flex-col gap-1.5 border-l-4" style="border-left-color: var(--color-tone-2);">
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.minimalGuideSibilantsTitle}
						</div>
						<p class="font-sans text-[11px] text-ink-muted leading-relaxed">
							{t().toneLab.minimalGuideSibilantsDesc}
						</p>
					</div>

					<div class="mech-card p-3 flex flex-col gap-1.5 border-l-4" style="border-left-color: var(--color-tone-4);">
						<div class="font-display text-xs font-bold text-ink">
							{t().toneLab.minimalGuideTonesTitle}
						</div>
						<p class="font-sans text-[11px] text-ink-muted leading-relaxed">
							{t().toneLab.minimalGuideTonesDesc}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<button
				type="button"
				onclick={startListenPick}
				class="mech-btn p-5 text-left flex flex-col gap-2.5 cursor-pointer group bg-card border-l-6 border-l-tone-1 hover:border-tone-1 transition-all"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2 text-tone-1 font-display text-xs font-bold">
						<svg class="w-5 h-5 text-tone-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M3 18v-6a9 9 0 0 1 18 0v6" />
							<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
						</svg>
					</div>
					<span class="font-display text-base font-bold text-tone-1 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
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
				class="mech-btn p-5 text-left flex flex-col gap-2.5 cursor-pointer group bg-card border-l-6 border-l-action hover:border-action transition-all"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2 text-action font-display text-xs font-bold">
						<svg class="w-5 h-5 text-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
							<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
							<line x1="12" y1="19" x2="12" y2="23" />
							<line x1="8" y1="23" x2="16" y2="23" />
						</svg>
					</div>
					<span class="font-display text-base font-bold text-action opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
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

		<div class="mech-card overflow-hidden">
			<div class="p-4 border-b border-ink/15 bg-panel flex flex-col gap-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex flex-wrap items-center gap-3">
						<h2 class="font-display text-sm font-bold tracking-wider text-ink">
							{t().toneLab.dictionaryTab}
						</h2>
						<div class="relative flex items-center">
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="{t().common.search}..."
								class="font-mono text-xs px-2.5 py-1 pr-6 border border-ink/30 bg-card rounded-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-action w-36 sm:w-48"
								aria-label={t().common.search}
							/>
							{#if searchQuery}
								<button
									type="button"
									onclick={() => { searchQuery = ""; }}
									class="absolute right-2 text-xs font-bold text-ink-muted hover:text-ink cursor-pointer"
									aria-label={t().common.clear}
								>
									✕
								</button>
							{/if}
						</div>
					</div>
					<span class="font-mono text-xs text-ink-muted tabular-nums">
						{#if lab.mode === "single"}
							{filteredSingleSyllables.length} {t().toneLab.baseSyllablesCount} ({filteredSingleSyllables.reduce((acc, it) => acc + it.tones.length, 0)} {t().toneLab.syllablesCount})
						{:else}
							{filteredPairsList.length} {t().toneLab.syllablesCount}
						{/if}
					</span>
				</div>

				{#if lab.mode === "single"}
					<div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/10">
						<span class="font-display text-[11px] font-bold text-ink-muted mr-1">
							{t().toneLab.initialsLabel}:
						</span>
						{#each initialGroups as group (group.key)}
							<button
								type="button"
								class="data-pill px-2 py-0.5 text-xs font-mono cursor-pointer transition-all"
								class:bg-card={selectedInitialGroup === group.key}
								class:text-ink={selectedInitialGroup === group.key}
								class:font-bold={selectedInitialGroup === group.key}
								class:shadow-[1px_1px_0px_#1E1B18]={selectedInitialGroup === group.key}
								aria-pressed={selectedInitialGroup === group.key}
								onclick={() => { selectedInitialGroup = group.key; }}
							>
								{group.key === "all" ? t().toneLab.allInitials : group.label}
							</button>
						{/each}
					</div>
				{:else if lab.mode === "pairs"}
					<div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/10">
						<span class="font-display text-[11px] font-bold text-ink-muted mr-1">
							{t().toneLab.pairStartsLabel}:
						</span>
						<button
							type="button"
							class="data-pill px-2 py-0.5 text-xs font-mono cursor-pointer transition-all"
							class:bg-card={selectedPairStartFilter === null}
							class:text-ink={selectedPairStartFilter === null}
							class:font-bold={selectedPairStartFilter === null}
							class:shadow-[1px_1px_0px_#1E1B18]={selectedPairStartFilter === null}
							aria-pressed={selectedPairStartFilter === null}
							onclick={() => { selectedPairStartFilter = null; }}
						>
							{t().toneLab.allTonePairs}
						</button>
						{#each [1, 2, 3, 4] as toneNum}
							<button
								type="button"
								class="data-pill px-2 py-0.5 text-xs font-mono cursor-pointer transition-all"
								class:bg-card={selectedPairStartFilter === toneNum}
								class:text-ink={selectedPairStartFilter === toneNum}
								class:font-bold={selectedPairStartFilter === toneNum}
								class:shadow-[1px_1px_0px_#1E1B18]={selectedPairStartFilter === toneNum}
								aria-pressed={selectedPairStartFilter === toneNum}
								onclick={() => {
									selectedPairStartFilter = selectedPairStartFilter === toneNum ? null : toneNum;
								}}
							>
								T{toneNum} + ...
							</button>
						{/each}
					</div>
				{:else if lab.mode === "minimal"}
					<div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/10">
						<span class="font-display text-[11px] font-bold text-ink-muted mr-1">
							{t().toneLab.minimalFilterLabel}:
						</span>
						{#each [
							{ key: "all", label: t().toneLab.minimalCategories.all },
							{ key: "aspiration", label: t().toneLab.minimalCategories.aspiration },
							{ key: "sibilants", label: t().toneLab.minimalCategories.sibilants },
							{ key: "palatals", label: t().toneLab.minimalCategories.palatals },
							{ key: "finals", label: t().toneLab.minimalCategories.finals },
							{ key: "tones", label: t().toneLab.minimalCategories.tones },
						] as cat (cat.key)}
							<button
								type="button"
								class="data-pill px-2 py-0.5 text-xs font-mono cursor-pointer transition-all"
								class:bg-card={selectedMinimalCategoryFilter === cat.key}
								class:text-ink={selectedMinimalCategoryFilter === cat.key}
								class:font-bold={selectedMinimalCategoryFilter === cat.key}
								class:shadow-[1px_1px_0px_#1E1B18]={selectedMinimalCategoryFilter === cat.key}
								aria-pressed={selectedMinimalCategoryFilter === cat.key}
								onclick={() => {
									selectedMinimalCategoryFilter = cat.key;
								}}
							>
								{cat.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse min-w-[580px]" aria-label={t().toneLab.dictionaryTab}>
					<thead>
						<tr class="border-b border-ink bg-panel/60 font-display text-xs tracking-wider text-ink">
							{#if lab.mode === "minimal"}
								<th scope="col" class="py-3 px-4 w-32">{t().toneLab.contrastColumn}</th>
								<th scope="col" class="py-3 px-4">{t().toneLab.allMinimalPairs} (A)</th>
								<th scope="col" class="py-3 px-2 text-center w-8"></th>
								<th scope="col" class="py-3 px-4">{t().toneLab.allMinimalPairs} (B)</th>
								<th scope="col" class="py-3 px-4 text-right w-20">{t().matrix.audio}</th>
							{:else if lab.mode === "pairs"}
								<th scope="col" class="py-3 px-4">{t().toneLab.toneColumn}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.character}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.pinyin}</th>
								<th scope="col" class="py-3 px-4">{t().matrix.meaning}</th>
								<th scope="col" class="py-3 px-4 text-right">{t().matrix.audio}</th>
							{:else}
								<th scope="col" class="py-3 px-4 w-24">{t().toneLab.syllableColumn}</th>
								<th scope="col" class="py-3 px-2 text-center">
									<div class="inline-flex items-center gap-1.5 font-bold">
										<span class="w-2.5 h-2.5 rounded-full bg-tone-1 inline-block"></span>
										<span>{t().toneLab.tones.tone1.name}</span>
										{@render toneContourSvg(1, "w-5 h-3 text-tone-1 inline-block")}
									</div>
								</th>
								<th scope="col" class="py-3 px-2 text-center">
									<div class="inline-flex items-center gap-1.5 font-bold">
										<span class="w-2.5 h-2.5 rounded-full bg-tone-2 inline-block"></span>
										<span>{t().toneLab.tones.tone2.name}</span>
										{@render toneContourSvg(2, "w-5 h-3 text-tone-2 inline-block")}
									</div>
								</th>
								<th scope="col" class="py-3 px-2 text-center">
									<div class="inline-flex items-center gap-1.5 font-bold">
										<span class="w-2.5 h-2.5 rounded-full bg-tone-3 inline-block"></span>
										<span>{t().toneLab.tones.tone3.name}</span>
										{@render toneContourSvg(3, "w-5 h-3 text-tone-3 inline-block")}
									</div>
								</th>
								<th scope="col" class="py-3 px-2 text-center">
									<div class="inline-flex items-center gap-1.5 font-bold">
										<span class="w-2.5 h-2.5 rounded-full bg-tone-4 inline-block"></span>
										<span>{t().toneLab.tones.tone4.name}</span>
										{@render toneContourSvg(4, "w-5 h-3 text-tone-4 inline-block")}
									</div>
								</th>
								<th scope="col" class="py-3 px-2 text-center">
									<div class="inline-flex items-center gap-1.5 font-bold text-ink-muted">
										<span class="w-2.5 h-2.5 rounded-full bg-ink-muted inline-block"></span>
										<span>{t().toneLab.tones.neutral.name}</span>
										{@render toneContourSvg(0, "w-5 h-3 text-ink-muted inline-block")}
									</div>
								</th>
							{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-ink/15">
						{#if lab.mode === "single"}
							{#each paginatedSingleSyllables as item (item.id)}
								<tr class="hover:bg-panel/40 transition-colors">
									<td class="py-2.5 px-4">
										<span class="font-mono text-base font-bold text-ink tracking-wide">
											{item.syllable}
										</span>
									</td>
									{#each [1, 2, 3, 4] as toneNum}
										{@const variant = item.tones.find((t) => t.tone === toneNum)}
										<td class="py-2 px-2 text-center">
											{#if variant}
												<div class="flex justify-center">
													<button
														type="button"
														onclick={() => {
															lab.selectStimulusById(`syl_${item.syllable}-${toneNum}`);
															void lab.play();
														}}
														class="mech-btn min-w-[42px] h-[34px] px-1.5 inline-flex items-center justify-center gap-1 cursor-pointer transition-all border-l-3 rounded-xs text-xs font-mono font-bold shadow-[2px_2px_0px_#1E1B18]"
														style="border-left-color: var(--color-tone-{toneNum});"
														aria-label="{t().common.playAudio}: {variant.pinyin}"
													>
														<span class="text-ink">{variant.pinyin}</span>
														<span class="text-[9px] opacity-70" aria-hidden="true">▶</span>
													</button>
												</div>
											{:else}
												<span class="font-mono text-xs text-ink/20 select-none" aria-hidden="true">—</span>
											{/if}
										</td>
									{/each}
									<td class="py-2 px-2 text-center">
										{#if item.tones.find((t) => t.tone === 0)}
											{@const neutralVariant = item.tones.find((t) => t.tone === 0)}
											{#if neutralVariant}
												<div class="flex justify-center">
													<button
														type="button"
														onclick={() => {
															lab.selectStimulusById(`syl_${item.syllable}-0`);
															void lab.play();
														}}
														class="mech-btn min-w-[42px] h-[34px] px-1.5 inline-flex items-center justify-center gap-1 cursor-pointer transition-all border-l-3 rounded-xs text-xs font-mono font-bold shadow-[2px_2px_0px_#1E1B18]"
														style="border-left-color: var(--color-tone-neutral);"
														aria-label="{t().common.playAudio}: {neutralVariant.pinyin}"
													>
														<span class="text-ink">{neutralVariant.pinyin}</span>
														<span class="text-[9px] opacity-70" aria-hidden="true">▶</span>
													</button>
												</div>
											{/if}
										{:else}
											<span class="font-mono text-xs text-ink/20 select-none" aria-hidden="true">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						{:else}
							{#each filteredPairsList as item (item.id)}
								<tr class="hover:bg-panel/40 transition-colors">
									{#if lab.mode === "minimal"}
										<td class="py-3 px-4">
											<div class="flex flex-col gap-0.5">
												<span class="data-pill px-2 py-0.5 text-xs font-mono font-bold bg-panel border border-ink/20 w-fit">
													{item.label}
												</span>
												<span class="font-mono text-xs text-ink-muted">
													{item.pinyin}
												</span>
											</div>
										</td>
										<td class="py-3 px-4">
											{#if item.itemA}
												{@const itemA = item.itemA}
												<div class="flex items-center gap-2.5">
													<button
														type="button"
														onclick={() => {
															void lab.playSyllable(itemA.syllable, itemA.tone);
														}}
														class="mech-btn w-7 h-7 p-0 text-xs font-mono inline-flex items-center justify-center cursor-pointer rounded-xs shadow-[1px_1px_0px_#1E1B18] shrink-0"
														aria-label="{t().common.playAudio}: {itemA.pinyin}"
													>
														<span aria-hidden="true">▶</span>
													</button>
													<div class="flex flex-col">
														<div class="flex items-baseline gap-1.5">
															<span class="font-hanzi text-lg font-bold text-ink">{itemA.hanzi}</span>
															<span class="font-mono text-sm font-bold text-ink">{itemA.pinyin}</span>
														</div>
														<span class="font-sans text-[11px] text-ink-muted leading-tight">
															{i18n.locale === "es" ? itemA.es : itemA.en}
														</span>
													</div>
												</div>
											{/if}
										</td>
										<td class="py-3 px-2 text-center">
											<span class="font-mono text-xs font-bold text-ink-muted">vs</span>
										</td>
										<td class="py-3 px-4">
											{#if item.itemB}
												{@const itemB = item.itemB}
												<div class="flex items-center gap-2.5">
													<button
														type="button"
														onclick={() => {
															void lab.playSyllable(itemB.syllable, itemB.tone);
														}}
														class="mech-btn w-7 h-7 p-0 text-xs font-mono inline-flex items-center justify-center cursor-pointer rounded-xs shadow-[1px_1px_0px_#1E1B18] shrink-0"
														aria-label="{t().common.playAudio}: {itemB.pinyin}"
													>
														<span aria-hidden="true">▶</span>
													</button>
													<div class="flex flex-col">
														<div class="flex items-baseline gap-1.5">
															<span class="font-hanzi text-lg font-bold text-ink">{itemB.hanzi}</span>
															<span class="font-mono text-sm font-bold text-ink">{itemB.pinyin}</span>
														</div>
														<span class="font-sans text-[11px] text-ink-muted leading-tight">
															{i18n.locale === "es" ? itemB.es : itemB.en}
														</span>
													</div>
												</div>
											{/if}
										</td>
										<td class="py-3 px-4 text-right">
											<button
												type="button"
												onclick={() => {
													lab.selectStimulusById(item.id);
													void lab.play();
												}}
												class="mech-btn px-2 py-1 text-xs font-mono inline-flex items-center gap-1 cursor-pointer rounded-xs shadow-[1px_1px_0px_#1E1B18]"
												aria-label="{t().common.playAudio}: {item.pinyin}"
												title="Play both"
											>
												<span aria-hidden="true">▶▶</span>
											</button>
										</td>
									{:else if lab.mode === "pairs"}
										<td class="py-3 px-4">
											<div class="flex items-center gap-1.5 flex-wrap">
												<span
													class="data-pill px-2 py-0.5 text-xs text-card font-bold"
													style="background-color: var(--color-tone-{item.tones[0]});"
												>
													T{item.tones[0]}
												</span>
												<span class="text-ink-muted text-xs font-bold">+</span>
												<span
													class="data-pill px-2 py-0.5 text-xs text-card font-bold"
													style="background-color: var(--color-tone-{item.tones[1] ?? 0});"
												>
													T{item.tones[1] ?? 0}
												</span>
												{#if item.label === "3+3"}
													<span
														class="data-pill px-1.5 py-0.5 text-[10px] font-bold bg-tone-2 text-card"
														title={t().toneLab.sandhiBadge}
													>
														{t().toneLab.sandhiBadge}
													</span>
												{/if}
											</div>
										</td>
										<td class="py-3 px-4 font-hanzi text-xl font-bold text-ink">
											{item.hanzi}
										</td>
										<td class="py-3 px-4 font-mono text-base font-bold text-ink">
											{item.pinyin}
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
												class="mech-btn w-8 h-8 p-0 text-xs font-mono inline-flex items-center justify-center cursor-pointer rounded-xs shadow-[1px_1px_0px_#1E1B18]"
												aria-label="{t().common.playAudio}: {item.pinyin}"
											>
												<span aria-hidden="true">▶</span>
											</button>
										</td>
									{/if}
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			{#if lab.mode === "single" && totalSinglePages > 1}
				<div class="p-3 border-t border-ink/15 bg-panel flex items-center justify-between gap-2">
					<button
						type="button"
						class="mech-btn px-3 py-1 text-xs font-display font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						disabled={currentPage <= 1}
						onclick={() => { currentPage = Math.max(1, currentPage - 1); }}
					>
						← {t().common.previous}
					</button>
					<span class="font-mono text-xs text-ink-muted">
						{currentPage} / {totalSinglePages}
					</span>
					<button
						type="button"
						class="mech-btn px-3 py-1 text-xs font-display font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						disabled={currentPage >= totalSinglePages}
						onclick={() => { currentPage = Math.min(totalSinglePages, currentPage + 1); }}
					>
						{t().common.next} →
					</button>
				</div>
			{/if}
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
