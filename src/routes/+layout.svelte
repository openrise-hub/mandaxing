<script lang="ts">
	import './layout.css';
	import ToneStripeBanner from '#lib/components/ToneStripeBanner.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
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
			<nav class="col-span-4 flex items-center gap-2 md:col-span-5 lg:col-span-8"></nav>
			<div class="col-span-4 flex items-center justify-end gap-2 md:col-span-3 lg:col-span-4"></div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6 lg:px-8">
		{@render children()}
	</main>

	<footer class="border-ink border-t-[1.5px] bg-panel">
		<div class="mx-auto w-full max-w-[1280px] px-4 py-3 md:px-6 lg:px-8"></div>
	</footer>
</div>
