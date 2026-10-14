import type { Grade } from "ts-fsrs";
import bank01 from "#lib/data/bank-01-pronouns.json";
import bank02 from "#lib/data/bank-02-questions.json";
import bank03 from "#lib/data/bank-03-verbs.json";
import { db, type SRSCardRecord, type SRSItemType } from "#lib/db/database";
import {
	createNewFSRSCard,
	type ScheduledReview,
	scheduleReview,
} from "#lib/srs/scheduler";
import type { WordBankEntry, WordBankItem } from "#lib/types/catalogs";

const WORD_BANK_ITEMS: WordBankItem[] = [
	...(bank01 as WordBankItem[]),
	...(bank02 as WordBankEntry[]),
	...(bank03 as WordBankEntry[]),
];

export async function getDueCards(now = new Date()): Promise<SRSCardRecord[]> {
	return db.cards.where("due").belowOrEqual(now).sortBy("due");
}

export async function initializeWordCards(now = new Date()): Promise<number> {
	return db.transaction("rw", [db.cards], async () => {
		const existing = new Set(
			(await db.cards.where("itemType").equals("word").toArray()).map(
				(card) => card.itemId,
			),
		);
		const missing = WORD_BANK_ITEMS.filter((item) => !existing.has(item.id));
		await db.cards.bulkAdd(
			missing.map((item) => createNewFSRSCard("word", item.id, now)),
		);
		return missing.length;
	});
}

export async function ensureCard(
	itemType: SRSItemType,
	itemId: string,
	now = new Date(),
): Promise<SRSCardRecord> {
	const existing = await db.cards
		.where("itemId")
		.equals(itemId)
		.and((card) => card.itemType === itemType)
		.first();
	if (existing) {
		return existing;
	}
	const card = createNewFSRSCard(itemType, itemId, now);
	card.id = await db.cards.add(card);
	return card;
}

export async function submitReview(
	card: SRSCardRecord,
	rating: Grade,
	now = new Date(),
): Promise<ScheduledReview> {
	const scheduled = scheduleReview(card, rating, now);
	await db.transaction("rw", [db.cards, db.reviews], async () => {
		if (scheduled.card.id === undefined) {
			scheduled.card.id = await db.cards.add(scheduled.card);
		} else {
			await db.cards.put(scheduled.card);
		}
		await db.reviews.add({
			cardId: scheduled.card.id ?? 0,
			reviewTime: scheduled.reviewTime,
			rating: Number(rating) as 1 | 2 | 3 | 4,
		});
	});
	return scheduled;
}
