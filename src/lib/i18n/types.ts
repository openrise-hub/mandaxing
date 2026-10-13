export type Locale = "en" | "es";

export interface TranslationSchema {
	common: {
		appName: string;
		loading: string;
		valid: string;
		retry: string;
		accuracy: string;
		offline: string;
		language: string;
		audioUnavailable: string;
	};
	navigation: {
		singleTones: string;
		tonePairs: string;
		minimalPairs: string;
	};
	toneLab: {
		title: string;
		subtitle: string;
		playReference: string;
		recordVoice: string;
		stopVoice: string;
		listeningPadTitle: string;
		pitchAnchors: {
			high: string;
			low: string;
		};
		tones: {
			tone1: { name: string; description: string };
			tone2: { name: string; description: string };
			tone3: { name: string; description: string };
			tone4: { name: string; description: string };
			neutral: { name: string; description: string };
		};
	};
	wordBank: {
		title: string;
		pronouns: string;
		greetings: string;
	};
}
