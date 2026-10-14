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
		playAudio: "Reproducir pronunciación",
		previous: "Anterior",
		next: "Siguiente",
	},
	navigation: {
		toneLab: "Laboratorio de tonos",
		hanziStudio: "Estudio Hanzi",
		dailyReview: "Repaso diario",
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
	hanziStudio: {
		title: "Estudio de Caracteres Hanzi",
		subtitle:
			"Traza cada trazo sobre las guías mǐzìgé; la dirección y la forma se verifican mientras dibujas.",
		strokesLabel: "Trazos",
		clearCanvas: "Borrar trazos",
		radicalLabel: "Radical (significado)",
		phoneticLabel: "Fonético (sonido)",
		noPhonetic: "Sin componente fonético",
		compoundWords: "Palabras compuestas",
		mastered: "Completado sin errores",
		strokeHintStart: "Comienza en el inicio del trazo",
		strokeHintEnd: "Termina al final del trazo",
		strokeHintDeviation: "Mantente más cerca de la línea guía",
		unavailable: "Datos del carácter no disponibles",
	},
	srs: {
		title: "Repaso diario",
		subtitle:
			"Califica cada tarjeta con honestidad; el planificador decide el próximo repaso.",
		dueCount: "Pendientes ahora",
		emptyState: "No hay repasos pendientes por ahora. Vuelve más tarde.",
		revealAnswer: "Mostrar respuesta",
		ratings: {
			again: "Otra vez",
			hard: "Difícil",
			good: "Bien",
			easy: "Fácil",
		},
		minutesUnit: "min",
		daysUnit: "días",
		lessThanAMinute: "menos de un minuto",
		shortcutsHint:
			"Pulsa 1 a 4 para calificar, Espacio para mostrar la respuesta",
	},
	backup: {
		title: "Respaldo de datos",
		exportAction: "Exportar JSON",
		importAction: "Importar JSON",
		importSuccess: "Respaldo restaurado",
		importError: "Respaldo rechazado: el archivo no es válido",
		exportError: "La exportación falló",
	},
};
