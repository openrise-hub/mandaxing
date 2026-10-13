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

export class MandaxingDatabase extends Dexie {
	calibrations!: Table<ToneCalibrationRecord, number>;
	discriminationTests!: Table<DiscriminationTestRecord, number>;
	preferences!: Table<UserPreferencesRecord, string>;

	constructor() {
		super("MandaxingPhase1DB");
		this.version(1).stores({
			calibrations: "++id, syllable, expectedTone, passed, timestamp",
			discriminationTests: "++id, testType, correct, timestamp",
			preferences: "key",
		});
	}
}

export const db = new MandaxingDatabase();
