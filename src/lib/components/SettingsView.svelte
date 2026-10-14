<script lang="ts">
	import BackupControls from "#lib/components/BackupControls.svelte";
	import LanguageSwitcher from "#lib/components/LanguageSwitcher.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
</script>

<div class="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
	<!-- Top Bar with Return Navigation -->
	<div class="flex items-center justify-between border-b-2 border-[var(--color-ink)]/15 pb-4">
		<div>
			<h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
				{i18n.current === "es" ? "Ajustes y Datos" : "Settings & Data"}
			</h1>
			<p class="font-sans text-xs md:text-sm text-[var(--color-ink-muted)] mt-1">
				{i18n.current === "es" ? "Configuración y respaldo de base de datos local" : "Local configuration and database backups"}
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

	<!-- Language Selection Section -->
	<section class="mech-card p-6 flex flex-col gap-3">
		<h2 class="font-display text-base font-bold text-[var(--color-ink)]">
			{i18n.current === "es" ? "Idioma de la Interfaz" : "Interface Language"}
		</h2>
		<p class="font-sans text-xs text-[var(--color-ink-muted)]">
			{i18n.current === "es" ? "Seleccione entre español e inglés" : "Select between Spanish and English"}
		</p>
		<div class="pt-1">
			<LanguageSwitcher />
		</div>
	</section>

	<!-- Local-First Backup Section -->
	<BackupControls />

	<!-- System Architecture Info -->
	<section class="mech-card p-6 flex flex-col gap-2">
		<h2 class="font-display text-base font-bold text-[var(--color-ink)]">
			{i18n.current === "es" ? "Arquitectura Local" : "Local-First Architecture"}
		</h2>
		<p class="font-sans text-xs text-[var(--color-ink-muted)] leading-relaxed">
			{i18n.current === "es"
				? "Toda la información de aprendizaje, curvas de retención FSRS y grabaciones de audio se almacenan exclusivamente en su navegador mediante IndexedDB. Sin rastreadores ni cuentas externas."
				: "All learning data, FSRS retention intervals, and audio evaluations remain strictly inside your browser using IndexedDB. No external tracking or required accounts."}
		</p>
	</section>
</div>
