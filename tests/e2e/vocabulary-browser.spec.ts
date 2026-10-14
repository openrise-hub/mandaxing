import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test.describe("Vocabulary browser workspace", () => {
	test.beforeEach(async ({ page }) => {
		await interceptAudioCdn(page);
		await page.goto("/");
		await page
			.getByRole("button", { name: /Vocabulary: Core Word Banks/i })
			.click();
		await expect(
			page.getByRole("heading", { name: /Vocabulary Matrix/i }),
		).toBeVisible();
	});

	test("displays category tabs and switches between them", async ({ page }) => {
		await expect(page.getByText("Pronouns and Demonstratives")).toBeVisible();
		await expect(page.getByText("我")).toBeVisible();

		await page.getByRole("button", { name: /Question Words/i }).click();
		await expect(page.getByText("什么")).toBeVisible();

		await page.getByRole("button", { name: /Core Verbs/i }).click();
		await expect(page.getByText("是")).toBeVisible();

		await page
			.getByRole("button", { name: /Numbers and Classifiers/i })
			.click();
		await expect(page.getByText("一")).toBeVisible();
	});

	test("filters words by search query", async ({ page }) => {
		const searchInput = page.getByPlaceholder(
			/Search by character, pinyin, or meaning/i,
		);
		await searchInput.fill("我");

		await expect(page.getByText("wǒ").first()).toBeVisible();
		await expect(page.getByText("他")).not.toBeVisible();

		await searchInput.fill("");
		await expect(page.getByText("他")).toBeVisible();
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
