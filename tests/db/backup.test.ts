import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
	BACKUP_FORMAT_VERSION,
	BackupValidationError,
	exportDatabaseToJson,
	importDatabaseFromJson,
} from "#lib/db/backup";
import { db } from "#lib/db/database";

const DUE = "2026-01-01T00:00:00.000Z";
const TAMPER_STAMP = "2026-01-02T00:00:00.000Z";

async function clearAll(): Promise<void> {
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
		},
	);
}

async function seedAll(): Promise<void> {
	await db.calibrations.add({
		timestamp: new Date("2026-01-01T10:00:00.000Z"),
		syllable: "ma",
		expectedTone: 3,
		accuracyScore: 90,
		passed: true,
	});
	await db.discriminationTests.add({
		timestamp: new Date("2026-01-01T10:05:00.000Z"),
		testType: "MINIMAL",
		targetPrompt: "bā",
		userSelection: "pā",
		correct: false,
		responseTimeMs: 1200,
	});
	await db.preferences.put({ key: "locale", value: "es" });
	await db.cards.add({
		itemType: "word",
		itemId: "wb1_women",
		due: new Date(DUE),
		stability: 0,
		difficulty: 0,
		elapsedDays: 0,
		scheduledDays: 0,
		learningSteps: 0,
		reps: 0,
		lapses: 0,
		state: 0,
	});
	await db.reviews.add({
		cardId: 1,
		reviewTime: new Date("2026-01-01T12:00:00.000Z"),
		rating: 3,
	});
	await db.characterMastery.add({
		character: "什",
		completedCleanly: true,
		lastPracticed: new Date("2026-01-01T12:30:00.000Z"),
	});
}

async function exportAsRecord(): Promise<Record<string, unknown>> {
	const json = await exportDatabaseToJson();
	return JSON.parse(json) as Record<string, unknown>;
}

beforeEach(async () => {
	await clearAll();
});

describe("backup export", () => {
	it("exposes the version 2 stores on the database", async () => {
		await db.open();
		const names = db.tables.map((table) => table.name);
		expect(names).toEqual(
			expect.arrayContaining(["cards", "reviews", "characterMastery"]),
		);
	});

	it("includes every table with the format version and an ISO timestamp", async () => {
		await seedAll();
		const payload = await exportAsRecord();
		expect(payload.version).toBe(BACKUP_FORMAT_VERSION);
		expect(typeof payload.exportedAt).toBe("string");
		expect(Number.isNaN(Date.parse(payload.exportedAt as string))).toBe(false);
		expect((payload.cards as unknown[]).length).toBe(1);
		expect((payload.characterMastery as unknown[]).length).toBe(1);
	});
});

describe("backup round trip", () => {
	it("restores every table without losing records", async () => {
		await seedAll();
		const json = await exportDatabaseToJson();
		await clearAll();
		const summary = await importDatabaseFromJson(json);
		expect(summary).toEqual({
			calibrations: 1,
			discriminationTests: 1,
			preferences: 1,
			cards: 1,
			reviews: 1,
			characterMastery: 1,
		});
		const cards = await db.cards.toArray();
		expect(cards.length).toBe(1);
		expect(cards[0]?.due instanceof Date).toBe(true);
		expect(cards[0]?.due.getTime()).toBe(new Date(DUE).getTime());
		expect(await db.preferences.get("locale")).toEqual({
			key: "locale",
			value: "es",
		});
		expect(await db.reviews.count()).toBe(1);
		expect(await db.characterMastery.count()).toBe(1);
	});
});

describe("backup import validation", () => {
	it("rejects input that is not valid JSON", async () => {
		await expect(importDatabaseFromJson("not json")).rejects.toThrow(
			BackupValidationError,
		);
	});

	it("rejects prototype pollution attempts without touching Object.prototype", async () => {
		const malicious = `{"exportedAt":"${TAMPER_STAMP}","version":${BACKUP_FORMAT_VERSION},"calibrations":[],"discriminationTests":[],"preferences":[],"cards":[],"reviews":[],"characterMastery":[{"__proto__":{"polluted":true},"character":"x","completedCleanly":true,"lastPracticed":"${TAMPER_STAMP}"}]}`;
		await expect(importDatabaseFromJson(malicious)).rejects.toThrow(
			BackupValidationError,
		);
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it("rejects corrupted record types", async () => {
		const badCard = await exportAsRecord();
		(badCard.cards as Record<string, unknown>[]).push({
			itemType: "word",
			itemId: "wb1_women",
			due: 12345,
			stability: 0,
			difficulty: 0,
			elapsedDays: 0,
			scheduledDays: 0,
			reps: 0,
			lapses: 0,
			state: 0,
		});
		await expect(
			importDatabaseFromJson(JSON.stringify(badCard)),
		).rejects.toThrow(BackupValidationError);
		const badReview = await exportAsRecord();
		(badReview.reviews as Record<string, unknown>[]).push({
			cardId: 1,
			reviewTime: TAMPER_STAMP,
			rating: 9,
		});
		await expect(
			importDatabaseFromJson(JSON.stringify(badReview)),
		).rejects.toThrow(BackupValidationError);
	});

	it("rejects unsupported backup versions", async () => {
		const payload = await exportAsRecord();
		payload.version = 1;
		await expect(
			importDatabaseFromJson(JSON.stringify(payload)),
		).rejects.toThrow(BackupValidationError);
	});

	it("leaves existing data untouched when validation fails", async () => {
		await db.preferences.put({ key: "locale", value: "es" });
		const payload = await exportAsRecord();
		(payload.cards as Record<string, unknown>[]).push({
			itemType: "word",
			itemId: "",
		});
		await expect(
			importDatabaseFromJson(JSON.stringify(payload)),
		).rejects.toThrow(BackupValidationError);
		expect(await db.preferences.get("locale")).toEqual({
			key: "locale",
			value: "es",
		});
	});
});
