import Dexie, { type Table } from "dexie";

export interface ToneCalibrationRecord {
	id?: number;
	timestamp: Date;
	syllable: string;
	expectedTone: number;
	accuracyScore: number;
	passed: boolean;
}

export interface DiscriminationTestRecord {
	id?: number;
	timestamp: Date;
	testType: "SINGLE" | "PAIR" | "MINIMAL";
	targetPrompt: string;
	userSelection: string;
	correct: boolean;
	responseTimeMs: number;
}

export interface UserPreferencesRecord {
	key: string;
	value: string;
}

export type SRSReviewState = 0 | 1 | 2 | 3;

export type SRSItemType = "word" | "character";

export interface SRSCardRecord {
	id?: number;
	itemType: SRSItemType;
	itemId: string;
	due: Date;
	stability: number;
	difficulty: number;
	elapsedDays: number;
	scheduledDays: number;
	learningSteps: number;
	reps: number;
	lapses: number;
	state: SRSReviewState;
	lastReview?: Date | undefined;
}

export interface SRSReviewHistoryRecord {
	id?: number;
	cardId: number;
	reviewTime: Date;
	rating: 1 | 2 | 3 | 4;
}

export interface CharacterMasteryRecord {
	id?: number;
	character: string;
	completedCleanly: boolean;
	lastPracticed: Date;
}

export class MandaxingDatabase extends Dexie {
	calibrations!: Table<ToneCalibrationRecord, number>;
	discriminationTests!: Table<DiscriminationTestRecord, number>;
	preferences!: Table<UserPreferencesRecord, string>;
	cards!: Table<SRSCardRecord, number>;
	reviews!: Table<SRSReviewHistoryRecord, number>;
	characterMastery!: Table<CharacterMasteryRecord, number>;

	constructor() {
		super("mandaxing");
		this.version(1).stores({
			calibrations: "++id, syllable, expectedTone, passed, timestamp",
			discriminationTests: "++id, testType, correct, timestamp",
			preferences: "key",
		});
		this.version(2).stores({
			cards: "++id, itemType, itemId, due, state",
			reviews: "++id, cardId, reviewTime, rating",
			characterMastery: "++id, character, completedCleanly, lastPracticed",
		});
	}
}

export const db = new MandaxingDatabase();
