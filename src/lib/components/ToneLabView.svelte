<script lang="ts">
	import ControlPanel from "#lib/components/ControlPanel.svelte";
	import EarTrainingPad from "#lib/components/EarTrainingPad.svelte";
	import PitchCanvas from "#lib/components/PitchCanvas.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import StimulusCard from "#lib/components/StimulusCard.svelte";
	import WordBankPanel from "#lib/components/WordBankPanel.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { lab } from "#lib/state/tone-lab.svelte";

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
		!!current && !lab.currentUnavailable && lab.status !== "offline",
	);
	let minimalOptions = $derived((current?.pinyin ?? "").split(" / "));
	let blindBusy = $derived(
		lab.status === "loading" || lab.status === "playing",
	);

	function translationFor(): string {
		const stimulus = current;
		if (!stimulus) return "";
		if (stimulus.en === "" && stimulus.tones.length === 1) {
			const key = toneKeys[(stimulus.tones[0] ?? 0) as keyof typeof toneKeys];
			const tone = t().toneLab.tones[key];
			return `${tone.name}: ${tone.description}`;
		}
		return i18n.locale === "es" ? stimulus.es : stimulus.en;
	}
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
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
			{#if lab.mode === "minimal"}
				<section class="mech-card flex flex-wrap items-center gap-3 p-4">
					<button
						type="button"
						class="mech-btn px-4 py-2 font-display font-bold disabled:opacity-40 cursor-pointer"
						disabled={lab.status === "playing" || lab.status === "loading"}
						onclick={() => void lab.playMinimalPrompt()}
					>
						{t().toneLab.playReference}
					</button>
					{#if lab.minimalAnswered === null}
						<button
							type="button"
							class="mech-btn px-4 py-2 font-mono text-sm cursor-pointer"
							onclick={() => void lab.answerMinimal("A")}
						>
							A · {minimalOptions[0] ?? ""}
						</button>
						<button
							type="button"
							class="mech-btn px-4 py-2 font-mono text-sm cursor-pointer"
							onclick={() => void lab.answerMinimal("B")}
						>
							B · {minimalOptions[1] ?? ""}
						</button>
					{:else}
						<div role="status" aria-live="polite">
							<span
								class="data-pill px-2.5 py-1 text-xs text-card font-bold"
								class:bg-success={lab.minimalResult === true}
								class:bg-alert={lab.minimalResult === false}
							>
								{lab.minimalResult ? t().common.valid : t().common.retry}
							</span>
						</div>
					{/if}
				</section>
			{:else}
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
			{/if}
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
			<section
				class="mech-card sticky bottom-0 z-10 flex flex-col gap-3 p-4 md:static md:z-auto"
			>
				<div class="flex flex-wrap items-center gap-3">
					<button
						type="button"
						class="mech-btn px-4 py-2 font-display font-bold disabled:opacity-40 cursor-pointer"
						disabled={blindBusy}
						onclick={() => void lab.playBlindPrompt()}
					>
						{t().toneLab.playReference}
					</button>
					{#if lab.blindFeedback !== "idle"}
						<div role="status" aria-live="polite">
							<span
								class="data-pill px-2.5 py-1 text-xs text-card font-bold"
								class:bg-success={lab.blindFeedback === "correct"}
								class:bg-alert={lab.blindFeedback === "incorrect"}
							>
								{lab.blindFeedback === "correct"
									? t().common.valid
									: t().common.retry}
							</span>
						</div>
					{/if}
				</div>
				<EarTrainingPad
					disabled={lab.blindTarget === null ||
						blindBusy ||
						lab.blindFeedback !== "idle"}
					onSelect={(tone) => void lab.answerBlindTone(tone)}
				/>
			</section>
		</div>
	</div>

	<WordBankPanel
		items={lab.wordItems}
		onSelect={(item) => lab.selectWord(item)}
	/>
</div>
