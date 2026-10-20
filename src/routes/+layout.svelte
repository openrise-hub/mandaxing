<script lang="ts">
	import './layout.css';
	import ToneStripeBanner from "#lib/components/ToneStripeBanner.svelte";
	import LanguageSwitcher from "#lib/components/LanguageSwitcher.svelte";
	import SerpentineRibbon from "#lib/components/shapes/SerpentineRibbon.svelte";
	import { i18n, t } from "#lib/i18n/index.svelte";
	import { appView } from "#lib/state/app-view.svelte";
	import favicon from "#lib/assets/favicon.svg";
	import { onMount } from "svelte";
	import type { LayoutProps } from "./$types";

	let { children }: LayoutProps = $props();

	onMount(() => {
		void i18n.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative flex min-h-dvh flex-col">
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-card focus:text-ink focus:border-mech focus:font-display focus:text-xs focus:font-bold shadow-[2px_2px_0px_#1E1B18]"
	>
		{t().common.skipToContent}
	</a>
	{#if appView.current !== "dashboard" && appView.current !== "settings"}
		<div class="fixed top-[65px] inset-x-0 bottom-0 pointer-events-none -z-10 overflow-hidden select-none opacity-22" aria-hidden="true">
			<SerpentineRibbon class="w-full h-full min-w-full min-h-full" />
		</div>
	{/if}
	<header class="border-ink border-b-[1.5px] bg-card">
		<ToneStripeBanner />
		<div
			class="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 md:px-6 lg:px-8"
		>
			<button
				type="button"
				onclick={() => appView.set("dashboard")}
				class="font-display text-xl font-black tracking-tight hover:opacity-75 cursor-pointer text-left transition-opacity"
			>
				{t().common.appName}
			</button>
			<div class="flex items-center gap-2">
				<LanguageSwitcher />
				<button
					type="button"
					class="mech-btn p-1.5 text-xs flex items-center justify-center cursor-pointer"
					title={t().settings.title}
					aria-label={t().settings.title}
					onclick={() => appView.set("settings")}
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</header>

	<main id="main-content" class="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
