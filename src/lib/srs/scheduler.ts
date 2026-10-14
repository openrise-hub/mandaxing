import {
	type Card,
	createEmptyCard,
	fsrs,
	type Grade,
	generatorParameters,
	Rating,
	type State,
} from "ts-fsrs";
import type {
	SRSCardRecord,
	SRSItemType,
	SRSReviewState,
} from "#lib/db/database";

export const TARGET_RETENTION = 0.9;
export const MAXIMUM_INTERVAL_DAYS = 36500;

export const REVIEW_RATINGS: readonly Grade[] = [
	Rating.Again,
	Rating.Hard,
	Rating.Good,
	Rating.Easy,
];

const scheduler = fsrs(
	generatorParameters({
		request_retention: TARGET_RETENTION,
		maximum_interval: MAXIMUM_INTERVAL_DAYS,
	}),
);

export interface ScheduledReview {
	card: SRSCardRecord;
	reviewTime: Date;
	rating: Grade;
}

export interface RatingPreview {
	rating: Grade;
	due: Date;
	intervalMinutes: number;
}

function toFSRSCard(record: SRSCardRecord): Card {
	const card: Card = {
		due: record.due,
		stability: record.stability,
		difficulty: record.difficulty,
		elapsed_days: record.elapsedDays,
		scheduled_days: record.scheduledDays,
		learning_steps: record.learningSteps,
		reps: record.reps,
		lapses: record.lapses,
		state: Number(record.state) as State,
	};
	if (record.lastReview !== undefined) {
		card.last_review = record.lastReview;
	}
	return card;
}

function fromFSRSCard(
	card: Card,
	itemType: SRSItemType,
	itemId: string,
): SRSCardRecord {
	const record: SRSCardRecord = {
		itemType,
		itemId,
		due: card.due,
		stability: card.stability,
		difficulty: card.difficulty,
		elapsedDays: card.elapsed_days,
		scheduledDays: card.scheduled_days,
		learningSteps: card.learning_steps,
		reps: card.reps,
		lapses: card.lapses,
		state: Number(card.state) as SRSReviewState,
	};
	if (card.last_review !== undefined) {
		record.lastReview = card.last_review;
	}
	return record;
}

export function createNewFSRSCard(
	itemType: SRSItemType,
	itemId: string,
	now = new Date(),
): SRSCardRecord {
	return fromFSRSCard(createEmptyCard(now), itemType, itemId);
}

export function scheduleReview(
	record: SRSCardRecord,
	rating: Grade,
	now = new Date(),
): ScheduledReview {
	const result = scheduler.next(toFSRSCard(record), now, rating);
	const card = fromFSRSCard(result.card, record.itemType, record.itemId);
	if (record.id !== undefined) {
		card.id = record.id;
	}
	return { card, reviewTime: result.log.review, rating };
}

export function previewRatings(
	record: SRSCardRecord,
	now = new Date(),
): RatingPreview[] {
	const preview = scheduler.repeat(toFSRSCard(record), now);
	return REVIEW_RATINGS.map((rating) => {
		const due = preview[rating].card.due;
		return {
			rating,
			due,
			intervalMinutes: Math.max(
				0,
				Math.round((due.getTime() - now.getTime()) / 60_000),
			),
		};
	});
}
