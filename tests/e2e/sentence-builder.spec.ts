import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test.describe("Sentence builder practice", () => {
	test.beforeEach(async ({ page }) => {
		await interceptAudioCdn(page);
		await page.goto("/");
		await page
			.getByRole("button", { name: /Sentences: Syntax Assembly/i })
			.click();
		await expect(
			page.getByRole("heading", { name: "Sentence Builder" }),
		).toBeVisible();
	});

	test("places word chips into slot track and validates correct order", async ({
		page,
	}) => {
		await expect(page.getByText("S + T + L + V + O")).toBeVisible();
		await expect(page.getByText("Available Word Pool")).toBeVisible();

		// Click available words in order: 我 -> 想 -> 喝 -> 水
		await page.getByRole("button", { name: /我/ }).first().click();
		await page.getByRole("button", { name: /想/ }).first().click();
		await page.getByRole("button", { name: /喝/ }).first().click();
		await page.getByRole("button", { name: /水/ }).first().click();

		const checkBtn = page.getByRole("button", { name: "Check Order" });
		await expect(checkBtn).toBeEnabled();
		await checkBtn.click();

		await expect(page.getByText(/Correct sentence structure/i)).toBeVisible();
	});

	test("allows removing chips and clearing the track", async ({ page }) => {
		await page.getByRole("button", { name: /我/ }).first().click();
		await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();

		await page.getByRole("button", { name: "Clear" }).click();
		await expect(
			page.getByText(/Tap words below to place them in sequence/i),
		).toBeVisible();
	});

	test("advances to next drill sentence", async ({ page }) => {
		await expect(page.getByText(/Target 1 \//i)).toBeVisible();
		await page.getByRole("button", { name: /Next/i }).last().click();
		await expect(page.getByText(/Target 2 \//i)).toBeVisible();
	});
});
