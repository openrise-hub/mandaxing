import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test.describe("Home dashboard navigation", () => {
	test.beforeEach(async ({ page }) => {
		await interceptAudioCdn(page);
		await page.goto("/");
	});

	test("displays all primary study emblems and companion cards", async ({
		page,
	}) => {
		await expect(
			page.getByRole("button", { name: /Tones: Pitch and Pronunciation/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Hanzi: Character Stroke Writing/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Sentences: Syntax Assembly/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Vocabulary: Core Word Banks/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Daily Review/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Graded Reader/i }),
		).toBeVisible();
	});

	test("navigates to Tone Lab and returns to dashboard", async ({ page }) => {
		await page
			.getByRole("button", { name: /Tones: Pitch and Pronunciation/i })
			.click();
		await expect(
			page.getByRole("heading", { name: "Tone and Pinyin Lab" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: /Tones: Pitch and Pronunciation/i }),
		).toBeVisible();
	});

	test("navigates to Hanzi Studio and returns to dashboard", async ({
		page,
	}) => {
		await page
			.getByRole("button", { name: /Hanzi: Character Stroke Writing/i })
			.click();
		await expect(
			page.getByRole("heading", { name: "Hanzi Blueprint Studio" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: /Hanzi: Character Stroke Writing/i }),
		).toBeVisible();
	});

	test("navigates to Sentences and returns to dashboard", async ({ page }) => {
		await page
			.getByRole("button", { name: /Sentences: Syntax Assembly/i })
			.click();
		await expect(
			page.getByRole("heading", { name: "Sentence Builder" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: /Sentences: Syntax Assembly/i }),
		).toBeVisible();
	});

	test("navigates to Vocabulary Browser and returns to dashboard", async ({
		page,
	}) => {
		await page
			.getByRole("button", { name: /Vocabulary: Core Word Banks/i })
			.click();
		await expect(
			page.getByRole("heading", { name: "Vocabulary Browser" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: /Vocabulary: Core Word Banks/i }),
		).toBeVisible();
	});

	test("navigates to Settings and returns via back button", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Settings" }).click();
		await expect(
			page.getByRole("heading", { name: "Settings and Data" }),
		).toBeVisible();

		await page.getByRole("button", { name: "Back", exact: true }).click();
		await expect(
			page.getByRole("button", { name: /Tones: Pitch and Pronunciation/i }),
		).toBeVisible();
	});
});
