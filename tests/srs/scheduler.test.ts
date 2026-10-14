import "fake-indexeddb/auto";
import { Rating, State } from "ts-fsrs";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "#lib/db/database";
import {
	ensureCard,
	getDueCards,
	initializeWordCards,
	submitReview,
} from "#lib/srs/queue";
import {
	createNewFSRSCard,
	MAXIMUM_INTERVAL_DAYS,
	previewRatings,
	REVIEW_RATINGS,
	scheduleReview,
} from "#lib/srs/scheduler";

const NOW = new Date("2026-01-01T00:00:00.000Z");

async function clearCards(): Promise<void> {
	await db.transaction("rw", [db.cards, db.reviews], async () => {
		await db.cards.clear();
		await db.reviews.clear();
	});
}

function minutesUntil(date: Date): number {
	return (date.getTime() - NOW.getTime()) / 60_000;
}

beforeEach(async () => {
	await clearCards();
});

describe("card factory", () => {
	it("creates a fresh card due immediately", () => {
		const card = createNewFSRSCard("word", "wb1_wo", NOW);
		expect(card).toMatchObject({
			itemType: "word",
			itemId: "wb1_wo",
			state: 0,
			reps: 0,
			lapses: 0,
		});
		expect(card.due.getTime()).toBe(NOW.getTime());
	});

	it("never schedules beyond the maximum interval", () => {
		const card = createNewFSRSCard("word", "wb1_wo", NOW);
		const scheduled = scheduleReview(card, Rating.Easy, NOW);
		expect(scheduled.card.scheduledDays).toBeLessThanOrEqual(
			MAXIMUM_INTERVAL_DAYS,
		);
	});
});

describe("interval transitions", () => {
	it("orders the four ratings from shortest to longest interval", () => {
		const card = createNewFSRSCard("word", "wb1_wo", NOW);
		const dues = REVIEW_RATINGS.map((rating) =>
			scheduleReview(card, rating, NOW).card.due.getTime(),
		);
		expect(dues).toEqual([...dues].sort((a, b) => a - b));
		expect(new Set(dues).size).toBe(4);
	});

	it("keeps a new card in learning with sub-day steps and graduates easy answers", () => {
		const card = createNewFSRSCard("word", "wb1_wo", NOW);
		const again = scheduleReview(card, Rating.Again, NOW);
		const hard = scheduleReview(card, Rating.Hard, NOW);
		const good = scheduleReview(card, Rating.Good, NOW);
		const easy = scheduleReview(card, Rating.Easy, NOW);
		expect(again.card.state).toBe(State.Learning);
		expect(good.card.state).toBe(State.Learning);
		expect(easy.card.state).toBe(State.Review);
		expect(minutesUntil(again.card.due)).toBeLessThan(10);
		expect(minutesUntil(hard.card.due)).toBeLessThan(
			minutesUntil(good.card.due),
		);
		expect(minutesUntil(easy.card.due)).toBeGreaterThanOrEqual(1440);
		expect(again.card.reps).toBe(1);
		expect(again.reviewTime.getTime()).toBe(NOW.getTime());
	});

	it("keeps a graduated card in review on a good answer", () => {
		const first = scheduleReview(
			createNewFSRSCard("word", "wb1_wo", NOW),
			Rating.Easy,
			NOW,
		);
		const second = scheduleReview(first.card, Rating.Good, first.card.due);
		expect(second.card.state).toBe(State.Review);
		expect(second.card.reps).toBe(first.card.reps + 1);
		expect(second.card.due.getTime()).toBeGreaterThan(first.card.due.getTime());
	});
});

describe("rating previews", () => {
	it("returns the four grades in order with increasing intervals", () => {
		const card = createNewFSRSCard("word", "wb1_wo", NOW);
		const previews = previewRatings(card, NOW);
		expect(previews.map((preview) => preview.rating)).toEqual([
			Rating.Again,
			Rating.Hard,
			Rating.Good,
			Rating.Easy,
		]);
		const minutes = previews.map((preview) => preview.intervalMinutes);
		expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
		expect(new Set(minutes).size).toBe(4);
		expect(minutes[0]).toBeGreaterThanOrEqual(0);
	});
});

describe("review queue", () => {
	it("returns only due cards sorted by due date", async () => {
		await db.cards.bulkAdd([
			{
				...createNewFSRSCard("word", "wb1_wo", NOW),
				due: new Date(NOW.getTime() - 60_000),
			},
			{
				...createNewFSRSCard("word", "wb1_ni", NOW),
				due: new Date(NOW.getTime() + 60_000),
			},
			{
				...createNewFSRSCard("word", "wb1_ta_he", NOW),
				due: new Date(NOW.getTime() - 120_000),
			},
		]);
		const due = await getDueCards(NOW);
		expect(due.map((card) => card.itemId)).toEqual(["wb1_ta_he", "wb1_wo"]);
	});

	it("initializes one card per word bank item and stays idempotent", async () => {
		const created = await initializeWordCards(NOW);
		expect(created).toBe(35);
		const second = await initializeWordCards(NOW);
		expect(second).toBe(0);
		expect(await db.cards.count()).toBe(35);
	});

	it("creates a card on demand and reuses the existing one", async () => {
		const card = await ensureCard("character", "什", NOW);
		expect(card.id).toBeDefined();
		const again = await ensureCard("character", "什", NOW);
		expect(again.id).toBe(card.id);
		expect(await db.cards.count()).toBe(1);
	});

	it("commits a review and removes the card from the due queue", async () => {
		const card = await ensureCard("word", "wb1_wo", NOW);
		expect((await getDueCards(NOW)).length).toBe(1);
		const scheduled = await submitReview(card, Rating.Good, NOW);
		expect(scheduled.card.reps).toBe(1);
		expect(await getDueCards(NOW)).toEqual([]);
		const [review] = await db.reviews.toArray();
		expect(review?.cardId).toBe(card.id);
		expect(review?.rating).toBe(Rating.Good);
		const stored = await db.cards.get(card.id ?? 0);
		expect(stored?.reps).toBe(1);
	});
});
