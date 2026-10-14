import {
	type CharacterMasteryRecord,
	type DiscriminationTestRecord,
	db,
	type SRSCardRecord,
	type SRSItemType,
	type SRSReviewHistoryRecord,
	type SRSReviewState,
	type ToneCalibrationRecord,
	type UserPreferencesRecord,
} from "#lib/db/database";

export const BACKUP_FORMAT_VERSION = 2;

export interface BackupPayload {
	exportedAt: string;
	version: number;
	calibrations: ToneCalibrationRecord[];
	discriminationTests: DiscriminationTestRecord[];
	preferences: UserPreferencesRecord[];
	cards: SRSCardRecord[];
	reviews: SRSReviewHistoryRecord[];
	characterMastery: CharacterMasteryRecord[];
}

export interface BackupImportSummary {
	calibrations: number;
	discriminationTests: number;
	preferences: number;
	cards: number;
	reviews: number;
	characterMastery: number;
}

export class BackupValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BackupValidationError";
	}
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const ITEM_TYPES: readonly SRSItemType[] = ["word", "character"];

const TEST_TYPES = ["SINGLE", "PAIR", "MINIMAL"] as const;

function assertSafeStructure(value: unknown, path: string): void {
	if (Array.isArray(value)) {
		value.forEach((entry, index) => {
			assertSafeStructure(entry, `${path}[${index}]`);
		});
		return;
	}
	if (typeof value !== "object" || value === null) {
		return;
	}
	for (const [key, entry] of Object.entries(value)) {
		if (FORBIDDEN_KEYS.has(key)) {
			throw new BackupValidationError(`unsafe key "${key}" at ${path}`);
		}
		assertSafeStructure(entry, `${path}.${key}`);
	}
}

function asObject(value: unknown, path: string): Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new BackupValidationError(`${path} must be an object`);
	}
	return value as Record<string, unknown>;
}

function asArray(value: unknown, path: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new BackupValidationError(`${path} must be an array`);
	}
	return value;
}

function asString(value: unknown, path: string): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new BackupValidationError(`${path} must be a non-empty string`);
	}
	return value;
}

function asText(value: unknown, path: string): string {
	if (typeof value !== "string") {
		throw new BackupValidationError(`${path} must be a string`);
	}
	return value;
}

function asFiniteNumber(value: unknown, path: string): number {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		throw new BackupValidationError(`${path} must be a finite number`);
	}
	return value;
}

function asInteger(value: unknown, path: string): number {
	const result = asFiniteNumber(value, path);
	if (!Number.isInteger(result)) {
		throw new BackupValidationError(`${path} must be an integer`);
	}
	return result;
}

function asNonNegativeNumber(value: unknown, path: string): number {
	const result = asFiniteNumber(value, path);
	if (result < 0) {
		throw new BackupValidationError(`${path} must not be negative`);
	}
	return result;
}

function asNonNegativeInteger(value: unknown, path: string): number {
	const result = asInteger(value, path);
	if (result < 0) {
		throw new BackupValidationError(`${path} must not be negative`);
	}
	return result;
}

function asBoolean(value: unknown, path: string): boolean {
	if (typeof value !== "boolean") {
		throw new BackupValidationError(`${path} must be a boolean`);
	}
	return value;
}

function asDate(value: unknown, path: string): Date {
	if (typeof value !== "string") {
		throw new BackupValidationError(`${path} must be an ISO date string`);
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new BackupValidationError(`${path} is not a valid date`);
	}
	return date;
}

function asOptionalDate(value: unknown, path: string): Date | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	return asDate(value, path);
}

function asOneOf<T extends string>(
	value: unknown,
	path: string,
	allowed: readonly T[],
): T {
	if (typeof value !== "string" || !allowed.includes(value as T)) {
		throw new BackupValidationError(
			`${path} must be one of: ${allowed.join(", ")}`,
		);
	}
	return value as T;
}

function asTone(value: unknown, path: string): number {
	const tone = asInteger(value, path);
	if (tone < 0 || tone > 4) {
		throw new BackupValidationError(`${path} must be a tone between 0 and 4`);
	}
	return tone;
}

function asRating(value: unknown, path: string): 1 | 2 | 3 | 4 {
	const rating = asInteger(value, path);
	if (rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4) {
		throw new BackupValidationError(`${path} must be a rating between 1 and 4`);
	}
	return rating;
}

function asReviewState(value: unknown, path: string): SRSReviewState {
	const state = asInteger(value, path);
	if (state !== 0 && state !== 1 && state !== 2 && state !== 3) {
		throw new BackupValidationError(
			`${path} must be a review state between 0 and 3`,
		);
	}
	return state;
}

function toCalibration(value: unknown, path: string): ToneCalibrationRecord {
	const record = asObject(value, path);
	const calibration: ToneCalibrationRecord = {
		timestamp: asDate(record.timestamp, `${path}.timestamp`),
		syllable: asString(record.syllable, `${path}.syllable`),
		expectedTone: asTone(record.expectedTone, `${path}.expectedTone`),
		accuracyScore: asNonNegativeNumber(
			record.accuracyScore,
			`${path}.accuracyScore`,
		),
		passed: asBoolean(record.passed, `${path}.passed`),
	};
	const id = record.id;
	if (id !== undefined) {
		calibration.id = asNonNegativeInteger(id, `${path}.id`);
	}
	return calibration;
}

function toDiscriminationTest(
	value: unknown,
	path: string,
): DiscriminationTestRecord {
	const record = asObject(value, path);
	const test: DiscriminationTestRecord = {
		timestamp: asDate(record.timestamp, `${path}.timestamp`),
		testType: asOneOf(record.testType, `${path}.testType`, TEST_TYPES),
		targetPrompt: asString(record.targetPrompt, `${path}.targetPrompt`),
		userSelection: asString(record.userSelection, `${path}.userSelection`),
		correct: asBoolean(record.correct, `${path}.correct`),
		responseTimeMs: asNonNegativeInteger(
			record.responseTimeMs,
			`${path}.responseTimeMs`,
		),
	};
	const id = record.id;
	if (id !== undefined) {
		test.id = asNonNegativeInteger(id, `${path}.id`);
	}
	return test;
}

function toPreference(value: unknown, path: string): UserPreferencesRecord {
	const record = asObject(value, path);
	return {
		key: asString(record.key, `${path}.key`),
		value: asText(record.value, `${path}.value`),
	};
}

function toCard(value: unknown, path: string): SRSCardRecord {
	const record = asObject(value, path);
	const card: SRSCardRecord = {
		itemType: asOneOf(record.itemType, `${path}.itemType`, ITEM_TYPES),
		itemId: asString(record.itemId, `${path}.itemId`),
		due: asDate(record.due, `${path}.due`),
		stability: asNonNegativeNumber(record.stability, `${path}.stability`),
		difficulty: asNonNegativeNumber(record.difficulty, `${path}.difficulty`),
		elapsedDays: asNonNegativeInteger(
			record.elapsedDays,
			`${path}.elapsedDays`,
		),
		scheduledDays: asNonNegativeInteger(
			record.scheduledDays,
			`${path}.scheduledDays`,
		),
		learningSteps: asNonNegativeInteger(
			record.learningSteps,
			`${path}.learningSteps`,
		),
		reps: asNonNegativeInteger(record.reps, `${path}.reps`),
		lapses: asNonNegativeInteger(record.lapses, `${path}.lapses`),
		state: asReviewState(record.state, `${path}.state`),
	};
	const id = record.id;
	if (id !== undefined) {
		card.id = asNonNegativeInteger(id, `${path}.id`);
	}
	const lastReview = asOptionalDate(record.lastReview, `${path}.lastReview`);
	if (lastReview !== undefined) {
		card.lastReview = lastReview;
	}
	return card;
}

function toReview(value: unknown, path: string): SRSReviewHistoryRecord {
	const record = asObject(value, path);
	const review: SRSReviewHistoryRecord = {
		cardId: asNonNegativeInteger(record.cardId, `${path}.cardId`),
		reviewTime: asDate(record.reviewTime, `${path}.reviewTime`),
		rating: asRating(record.rating, `${path}.rating`),
	};
	const id = record.id;
	if (id !== undefined) {
		review.id = asNonNegativeInteger(id, `${path}.id`);
	}
	return review;
}

function toCharacterMastery(
	value: unknown,
	path: string,
): CharacterMasteryRecord {
	const record = asObject(value, path);
	const mastery: CharacterMasteryRecord = {
		character: asString(record.character, `${path}.character`),
		completedCleanly: asBoolean(
			record.completedCleanly,
			`${path}.completedCleanly`,
		),
		lastPracticed: asDate(record.lastPracticed, `${path}.lastPracticed`),
	};
	const id = record.id;
	if (id !== undefined) {
		mastery.id = asNonNegativeInteger(id, `${path}.id`);
	}
	return mastery;
}

export async function exportDatabaseToJson(): Promise<string> {
	const [
		calibrations,
		discriminationTests,
		preferences,
		cards,
		reviews,
		characterMastery,
	] = await Promise.all([
		db.calibrations.toArray(),
		db.discriminationTests.toArray(),
		db.preferences.toArray(),
		db.cards.toArray(),
		db.reviews.toArray(),
		db.characterMastery.toArray(),
	]);
	const payload: BackupPayload = {
		exportedAt: new Date().toISOString(),
		version: BACKUP_FORMAT_VERSION,
		calibrations,
		discriminationTests,
		preferences,
		cards,
		reviews,
		characterMastery,
	};
	return JSON.stringify(payload, null, "\t");
}

export async function importDatabaseFromJson(
	json: string,
): Promise<BackupImportSummary> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		throw new BackupValidationError("the backup file is not valid JSON");
	}
	assertSafeStructure(parsed, "backup");
	const payload = asObject(parsed, "backup");
	const version = asInteger(payload.version, "backup.version");
	if (version !== BACKUP_FORMAT_VERSION) {
		throw new BackupValidationError(
			`unsupported backup version ${version} (expected ${BACKUP_FORMAT_VERSION})`,
		);
	}
	const exportedAt = asDate(payload.exportedAt, "backup.exportedAt");
	if (exportedAt.getTime() > Date.now() + 86_400_000) {
		throw new BackupValidationError("backup.exportedAt is in the future");
	}
	const calibrations = asArray(payload.calibrations, "backup.calibrations").map(
		(entry, index) => toCalibration(entry, `backup.calibrations[${index}]`),
	);
	const discriminationTests = asArray(
		payload.discriminationTests,
		"backup.discriminationTests",
	).map((entry, index) =>
		toDiscriminationTest(entry, `backup.discriminationTests[${index}]`),
	);
	const preferences = asArray(payload.preferences, "backup.preferences").map(
		(entry, index) => toPreference(entry, `backup.preferences[${index}]`),
	);
	const cards = asArray(payload.cards, "backup.cards").map((entry, index) =>
		toCard(entry, `backup.cards[${index}]`),
	);
	const reviews = asArray(payload.reviews, "backup.reviews").map(
		(entry, index) => toReview(entry, `backup.reviews[${index}]`),
	);
	const characterMastery = asArray(
		payload.characterMastery,
		"backup.characterMastery",
	).map((entry, index) =>
		toCharacterMastery(entry, `backup.characterMastery[${index}]`),
	);
	await db.transaction(
		"rw",
		[
			db.calibrations,
			db.discriminationTests,
			db.preferences,
			db.cards,
			db.reviews,
			db.characterMastery,
		],
		async () => {
			await Promise.all([
				db.calibrations.clear(),
				db.discriminationTests.clear(),
				db.preferences.clear(),
				db.cards.clear(),
				db.reviews.clear(),
				db.characterMastery.clear(),
			]);
			await db.calibrations.bulkAdd(calibrations);
			await db.discriminationTests.bulkAdd(discriminationTests);
			await db.preferences.bulkAdd(preferences);
			await db.cards.bulkAdd(cards);
			await db.reviews.bulkAdd(reviews);
			await db.characterMastery.bulkAdd(characterMastery);
		},
	);
	return {
		calibrations: calibrations.length,
		discriminationTests: discriminationTests.length,
		preferences: preferences.length,
		cards: cards.length,
		reviews: reviews.length,
		characterMastery: characterMastery.length,
	};
}
