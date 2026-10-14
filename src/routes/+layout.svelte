<script lang="ts">
	import './layout.css';
	import ToneStripeBanner from "#lib/components/ToneStripeBanner.svelte";
	import LanguageSwitcher from "#lib/components/LanguageSwitcher.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import favicon from "#lib/assets/favicon.svg";
	import { onMount } from "svelte";
	import type { LayoutProps } from "./$types";

	let { children }: LayoutProps = $props();

	onMount(() => {
		void i18n.init();
	});

	const views = [
		{ key: "lab", label: "toneLab" },
		{ key: "studio", label: "hanziStudio" },
		{ key: "review", label: "dailyReview" },
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="border-ink border-b-[1.5px] bg-card">
		<ToneStripeBanner />
		<div
			class="mx-auto grid w-full max-w-[1280px] grid-cols-4 items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-8 md:gap-x-4 md:px-6 lg:grid-cols-12 lg:gap-x-6 lg:px-8"
		>
			<div class="col-span-4 flex items-center gap-3 md:col-span-5 lg:col-span-8">
				<button
					type="button"
					onclick={() => appView.set("dashboard")}
					class="font-display text-lg font-bold tracking-tight hover:opacity-75 cursor-pointer text-left transition-opacity"
				>
					{t().common.appName}
				</button>
				<nav class="flex items-center gap-2">
					{#each views as view (view.key)}
						<button
							type="button"
							class="data-pill px-2 py-1 text-xs"
							class:bg-card={appView.current === view.key}
							aria-pressed={appView.current === view.key}
							onclick={() => appView.set(view.key)}
						>
							{t().navigation[view.label]}
						</button>
					{/each}
				</nav>
			</div>
			<div class="col-span-4 flex items-center justify-end gap-2 md:col-span-3 lg:col-span-4">
				<LanguageSwitcher />
				<button
					type="button"
					class="mech-btn p-1.5 text-xs flex items-center justify-center cursor-pointer"
					title={i18n.current === "es" ? "Ajustes y Datos" : "Settings & Data"}
					aria-label={i18n.current === "es" ? "Ajustes y Datos" : "Settings & Data"}
					onclick={() => appView.set("settings")}
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 lg:px-8">
		{@render children()}
	</main>

	<footer class="border-ink border-t-[1.5px] bg-panel">
		<div class="mx-auto w-full max-w-[1280px] px-4 py-3 md:px-6 lg:px-8"></div>
	</footer>
</div>
