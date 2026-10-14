import type { TranslationSchema } from "#lib/i18n/types";

export const en: TranslationSchema = {
	common: {
		appName: "Mandaxing",
		loading: "Loading...",
		valid: "Correct",
		retry: "Try again",
		accuracy: "Accuracy",
		offline: "Offline",
		language: "Language",
		audioUnavailable: "Audio unavailable",
	},
	navigation: {
		singleTones: "Single Tones",
		tonePairs: "Tone Pairs",
		minimalPairs: "Minimal Pairs",
	},
	toneLab: {
		title: "Tone and Pinyin Lab",
		subtitle:
			"Listen to native speakers and match their pitch with your voice.",
		playReference: "Listen",
		recordVoice: "Record",
		stopVoice: "Stop",
		listeningPadTitle: "Ear Training",
		pitchAnchors: {
			high: "High",
			low: "Low",
		},
		tones: {
			tone1: { name: "Tone 1", description: "High and flat (5-5)" },
			tone2: { name: "Tone 2", description: "Rising (3-5)" },
			tone3: { name: "Tone 3", description: "Dips and rises (2-1-4)" },
			tone4: { name: "Tone 4", description: "Sharp drop (5-1)" },
			neutral: { name: "Neutral Tone", description: "Short and soft" },
		},
	},
	wordBank: {
		title: "Practice Vocabulary",
		pronouns: "Pronouns",
		greetings: "Greetings",
	},
};
