<script lang="ts">
	import { i18n, t } from "#lib/i18n/index.svelte";
	import type { Locale } from "#lib/i18n/types";

	const options: Locale[] = ["en", "es"];

	function select(locale: Locale): void {
		void i18n.setLocale(locale);
	}
</script>

<div
	class="border-[1.5px] border-ink bg-panel p-[2px] inline-flex items-center select-none shadow-[2px_2px_0_0_var(--color-ink)]"
	role="group"
	aria-label={t().common.language}
>
	{#each options as option (option)}
		<button
			type="button"
			class="px-2.5 py-1 font-mono text-xs uppercase cursor-pointer transition-all border {i18n.locale === option
				? 'bg-card font-black text-ink shadow-[1px_1px_0_0_var(--color-ink)] border-ink'
				: 'bg-transparent font-medium text-ink-muted border-transparent hover:text-ink'}"
			aria-pressed={i18n.locale === option}
			onclick={() => select(option)}
		>
			{option}
		</button>
	{/each}
</div>
