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
			page.getByRole("button", { name: "Tones", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Hanzi", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Sentences", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Vocabulary", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Daily Review", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Graded Reader/i }),
		).toBeVisible();
	});

	test("navigates to Tone Lab and returns to dashboard", async ({ page }) => {
		await page.getByRole("button", { name: "Tones", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Pinyin and Tones" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: "Tones", exact: true }),
		).toBeVisible();
	});

	test("navigates to Hanzi Studio and returns to dashboard", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Hanzi", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Hanzi Blueprint Studio" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: "Hanzi", exact: true }),
		).toBeVisible();
	});

	test("navigates to Sentences and returns to dashboard", async ({ page }) => {
		await page.getByRole("button", { name: "Sentences", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Sentence Builder" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: "Sentences", exact: true }),
		).toBeVisible();
	});

	test("navigates to Vocabulary Browser and returns to dashboard", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Vocabulary", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: /Vocabulary Matrix/i }),
		).toBeVisible();

		await page
			.getByRole("button", { name: /Mandaxing/i })
			.first()
			.click();
		await expect(
			page.getByRole("button", { name: "Vocabulary", exact: true }),
		).toBeVisible();
	});

	test("navigates to Settings and returns via back button", async ({
		page,
	}) => {
		await page.getByRole("button", { name: /Settings/i }).click();
		await expect(
			page.getByRole("heading", { name: /Settings (&|and) Data/i }),
		).toBeVisible();

		await page.getByRole("button", { name: "Back", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Tones", exact: true }),
		).toBeVisible();
	});
});
