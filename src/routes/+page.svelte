<script lang="ts">
	import ControlPanel from "#lib/components/ControlPanel.svelte";
	import PitchCanvas from "#lib/components/PitchCanvas.svelte";
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

	let current = $derived(lab.currentStimulus);
	let busy = $derived(lab.status === "loading" || lab.status === "evaluating");
	let canUse = $derived(!!current && !lab.currentUnavailable && lab.status !== "offline");

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

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-2xl font-bold">{t().toneLab.title}</h1>
		<p class="text-sm text-ink-muted">{t().toneLab.subtitle}</p>
	</div>

	<section class="flex flex-col gap-4">
		<StimulusCard
			pinyin={current?.pinyin ?? ""}
			hanzi={current?.hanzi}
			translation={translationFor()}
			tones={current?.tones ?? []}
			label={current?.label}
		/>
		<PitchCanvas
			reference={lab.reference}
			user={lab.user}
			highlightTones={current?.tones ?? []}
		/>
		<div class="flex items-center gap-2">
			<button type="button" class="mech-btn px-3 py-1.5 text-sm" onclick={() => lab.setIndex(-1)}>
				{t().common.previous}
			</button>
			<button type="button" class="mech-btn px-3 py-1.5 text-sm" onclick={() => lab.setIndex(1)}>
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
	</section>

	<WordBankPanel items={lab.wordItems} onSelect={(item) => lab.selectWord(item)} />
</div>
