import { db } from "#lib/db/database";
import { en } from "#lib/i18n/locales/en";
import { es } from "#lib/i18n/locales/es";
import type { Locale, TranslationSchema } from "#lib/i18n/types";
import { browser } from "$app/env";

const catalogs: Record<Locale, TranslationSchema> = { en, es };

function detectLocale(): Locale {
	if (!browser) return "en";
	const languages = navigator.languages ?? [navigator.language];
	for (const language of languages) {
		if (language.toLowerCase().startsWith("es")) return "es";
	}
	return "en";
}

class I18n {
	locale = $state<Locale>(detectLocale());

	constructor() {
		if (browser) {
			document.documentElement.lang = this.locale;
		}
	}

	async init(): Promise<void> {
		if (!browser) return;
		const stored = await db.preferences.get("locale").catch(() => undefined);
		if (stored?.value === "en" || stored?.value === "es") {
			this.apply(stored.value);
		}
	}

	async setLocale(locale: Locale): Promise<void> {
		this.apply(locale);
		await db.preferences
			.put({ key: "locale", value: locale })
			.catch(() => undefined);
	}

	private apply(locale: Locale): void {
		this.locale = locale;
		document.documentElement.lang = locale;
	}
}

export const i18n = new I18n();

export function t(): TranslationSchema {
	return catalogs[i18n.locale];
}
