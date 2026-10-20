<script lang="ts">
	import BackupControls from "#lib/components/BackupControls.svelte";
	import LanguageSwitcher from "#lib/components/LanguageSwitcher.svelte";
	import SectionHeader from "#lib/components/SectionHeader.svelte";
	import { t } from "#lib/i18n/index.svelte";
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<SectionHeader
		title={t().settings.title}
		subtitle={t().settings.subtitle}
		backLabel={t().settings.back}
	/>

	<section class="mech-card p-6 flex flex-col gap-3">
		<h2 class="font-display text-base font-bold text-ink">
			{t().settings.languageTitle}
		</h2>
		<p class="font-sans text-xs text-ink-muted">
			{t().settings.languageSubtitle}
		</p>
		<div class="pt-1">
			<LanguageSwitcher />
		</div>
	</section>

	<BackupControls />

	<section class="mech-card p-6 flex flex-col gap-2">
		<h2 class="font-display text-base font-bold text-ink">
			{t().settings.architectureTitle}
		</h2>
		<p class="font-sans text-xs text-ink-muted leading-relaxed">
			{t().settings.architectureDesc}
		</p>
	</section>
</div>
