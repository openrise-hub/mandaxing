import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test.describe("Vocabulary browser workspace", () => {
	test.beforeEach(async ({ page }) => {
		await interceptAudioCdn(page);
		await page.goto("/");
		await page.getByRole("button", { name: "Vocabulary", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: /Vocabulary Matrix/i }),
		).toBeVisible();
	});

	test("displays category tabs and switches between them", async ({ page }) => {
		await expect(page.getByRole("button", { name: /Pronouns/i })).toBeVisible();
		await expect(
			page.getByRole("cell", { name: "我", exact: true }),
		).toBeVisible();

		await page.getByRole("button", { name: /Questions/i }).click();
		await expect(
			page.getByRole("cell", { name: "什么", exact: true }),
		).toBeVisible();

		await page.getByRole("button", { name: /Core Verbs/i }).click();
		await expect(
			page.getByRole("cell", { name: "是", exact: true }),
		).toBeVisible();

		await page.getByRole("button", { name: /Numbers/i }).click();
		await expect(
			page.getByRole("cell", { name: "一", exact: true }),
		).toBeVisible();
	});

	test("filters words by search query", async ({ page }) => {
		const searchInput = page.getByPlaceholder(
			/Search by character, pinyin, or meaning/i,
		);
		await searchInput.fill("我");

		await expect(page.getByText("wǒ").first()).toBeVisible();
		await expect(
			page.getByRole("cell", { name: "他", exact: true }),
		).not.toBeVisible();

		await searchInput.fill("");
		await expect(
			page.getByRole("cell", { name: "他", exact: true }),
		).toBeVisible();
	});

	test("launches targeted review for active category", async ({ page }) => {
		const reviewBtn = page.getByRole("button", {
			name: /Practice Category/i,
		});
		await expect(reviewBtn).toBeVisible();
		await reviewBtn.click();

		await expect(
			page.getByRole("heading", { name: "Daily Review" }),
		).toBeVisible();
	});
});
