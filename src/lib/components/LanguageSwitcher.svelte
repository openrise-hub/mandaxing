<script lang="ts">
	import { i18n, t } from "#lib/i18n/index.svelte";
	import type { Locale } from "#lib/i18n/types";

	const options: Locale[] = ["en", "es"];

	function select(locale: Locale): void {
		void i18n.setLocale(locale);
	}
</script>

<div class="flex items-center gap-1" role="group" aria-label={t().common.language}>
	{#each options as option (option)}
		<button
			type="button"
			class="mech-btn px-2 py-1 font-mono text-xs uppercase"
			class:bg-panel={i18n.locale === option}
			aria-pressed={i18n.locale === option}
			onclick={() => select(option)}
		>
			{option}
		</button>
	{/each}
</div>
