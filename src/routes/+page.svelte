<script lang="ts">
	import DailyReviewView from "#lib/components/DailyReviewView.svelte";
	import GradedReaderView from "#lib/components/GradedReaderView.svelte";
	import HanziStudioView from "#lib/components/HanziStudioView.svelte";
	import HomeDashboard from "#lib/components/HomeDashboard.svelte";
	import SentenceBuilder from "#lib/components/SentenceBuilder.svelte";
	import SettingsView from "#lib/components/SettingsView.svelte";
	import ToneLabView from "#lib/components/ToneLabView.svelte";
	import VocabularyBrowser from "#lib/components/VocabularyBrowser.svelte";
	import { appView } from "#lib/state/app-view.svelte";
</script>

{#if appView.current === "dashboard"}
	<HomeDashboard />
{:else if appView.current === "settings"}
	<SettingsView />
{:else if appView.current === "lab"}
	<ToneLabView />
{:else if appView.current === "studio"}
	<HanziStudioView />
{:else if appView.current === "review"}
	<DailyReviewView />
{:else if appView.current === "matrix"}
	<VocabularyBrowser />
{:else if appView.current === "sentences"}
	<SentenceBuilder />
{:else if appView.current === "reader"}
	<GradedReaderView />
{:else}
	<HomeDashboard />
{/if}
