import type { TranslationSchema } from "#lib/i18n/types";

export const es: TranslationSchema = {
	common: {
		appName: "Mandaxing",
		loading: "Cargando...",
		valid: "Correcto",
		retry: "Intenta de nuevo",
		accuracy: "Precisión",
		offline: "Sin conexión",
		language: "Idioma",
		audioUnavailable: "Audio no disponible",
		previous: "Anterior",
		next: "Siguiente",
	},
	navigation: {
		singleTones: "Tonos individuales",
		tonePairs: "Combinaciones de tonos",
		minimalPairs: "Pares mínimos",
	},
	toneLab: {
		title: "Laboratorio de Tonos y Pinyin",
		subtitle:
			"Escucha la pronunciación nativa y ajusta tu entonación hasta igualarla.",
		playReference: "Escuchar",
		recordVoice: "Grabar",
		stopVoice: "Detener",
		listeningPadTitle: "Entrena tu oído",
		pitchAnchors: {
			high: "Agudo",
			low: "Grave",
		},
		tones: {
			tone1: { name: "Tono 1", description: "Alto y sostenido (5-5)" },
			tone2: { name: "Tono 2", description: "Ascendente (3-5)" },
			tone3: { name: "Tono 3", description: "Baja y sube (2-1-4)" },
			tone4: { name: "Tono 4", description: "Caída rápida (5-1)" },
			neutral: { name: "Tono neutro", description: "Corto y suave" },
		},
	},
	wordBank: {
		title: "Vocabulario de práctica",
		pronouns: "Pronombres",
		greetings: "Saludos",
	},
};
