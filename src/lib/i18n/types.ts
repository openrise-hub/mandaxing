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
		playAudio: string;
		previous: string;
		next: string;
	};
	navigation: {
		toneLab: string;
		hanziStudio: string;
		dailyReview: string;
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
	hanziStudio: {
		title: string;
		subtitle: string;
		strokesLabel: string;
		clearCanvas: string;
		radicalLabel: string;
		phoneticLabel: string;
		noPhonetic: string;
		compoundWords: string;
		mastered: string;
		strokeHintStart: string;
		strokeHintEnd: string;
		strokeHintDeviation: string;
		unavailable: string;
	};
	srs: {
		title: string;
		subtitle: string;
		dueCount: string;
		emptyState: string;
		revealAnswer: string;
		ratings: {
			again: string;
			hard: string;
			good: string;
			easy: string;
		};
		minutesUnit: string;
		daysUnit: string;
		lessThanAMinute: string;
		shortcutsHint: string;
	};
	backup: {
		title: string;
		exportAction: string;
		importAction: string;
		importSuccess: string;
		importError: string;
		exportError: string;
	};
}
