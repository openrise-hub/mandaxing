import { beforeEach, describe, expect, it } from "vitest";
import CharacterPopover from "#lib/components/CharacterPopover.svelte";
import GradedReaderView from "#lib/components/GradedReaderView.svelte";
import { gradedReader } from "#lib/state/graded-reader.svelte";

describe("Graded Reader workspace and character lookup", () => {
	beforeEach(() => {
		gradedReader.currentPassageIndex = 0;
		gradedReader.closePopover();
		gradedReader.showPinyin = false;
		gradedReader.setSpeed(1.0);
	});

	it("exports GradedReaderView and CharacterPopover", () => {
		expect(GradedReaderView).toBeDefined();
		expect(CharacterPopover).toBeDefined();
	});

	it("initializes with populated passages and sentence records", () => {
		expect(gradedReader.passages.length).toBeGreaterThan(0);
		const p1 = gradedReader.currentPassage;
		expect(p1.titleHanzi).toBe("我的朋友");
		expect(p1.sentences.length).toBeGreaterThan(0);
	});

	it("toggles speed and pinyin display settings", () => {
		gradedReader.setSpeed(0.75);
		expect(gradedReader.playbackSpeed).toBe(0.75);
		gradedReader.setSpeed(1.0);
		expect(gradedReader.playbackSpeed).toBe(1.0);

		expect(gradedReader.showPinyin).toBe(false);
		gradedReader.togglePinyin();
		expect(gradedReader.showPinyin).toBe(true);
	});

	it("selects character and sets dictionary popover lookup", () => {
		gradedReader.selectCharacter("水");
		expect(gradedReader.selectedCharacter).toBeDefined();
		expect(gradedReader.selectedCharacter?.character).toBe("水");
		expect(gradedReader.selectedCharacter?.pinyin).toBe("shuǐ");

		gradedReader.closePopover();
		expect(gradedReader.selectedCharacter).toBeNull();
	});

	it("navigates forward and backward between passages", () => {
		expect(gradedReader.currentPassageIndex).toBe(0);
		gradedReader.nextPassage();
		expect(gradedReader.currentPassageIndex).toBe(1);
		gradedReader.previousPassage();
		expect(gradedReader.currentPassageIndex).toBe(0);
	});
});
