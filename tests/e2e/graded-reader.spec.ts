import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test.describe("Graded reader workspace", () => {
	test.beforeEach(async ({ page }) => {
		await interceptAudioCdn(page);
		await page.goto("/");
		await page.getByRole("button", { name: /Graded Reader/i }).click();
		await expect(
			page.getByRole("heading", { name: /我的朋友/i }),
		).toBeVisible();
	});

	test("displays beginner story text with speed controls", async ({ page }) => {
		await expect(page.getByText("HSK 1")).toBeVisible();
		await expect(page.getByText("My Friend")).toBeVisible();

		const speed075 = page.getByRole("button", { name: "0.75x" });
		const speed10 = page.getByRole("button", { name: "1.0x" });
		await expect(speed075).toBeVisible();
		await expect(speed10).toBeVisible();

		await speed075.click();
		await expect(speed075).toHaveClass(/bg-/);
	});

	test("toggles pinyin annotations above characters", async ({ page }) => {
		const togglePinyinBtn = page.getByRole("button", {
			name: /Show Pinyin|Mostrar Pinyin/i,
		});
		await expect(togglePinyinBtn).toBeVisible();
		await togglePinyinBtn.click();

		await expect(page.getByText("wǒ").first()).toBeVisible();

		const hidePinyinBtn = page.getByRole("button", {
			name: /Hide Pinyin|Ocultar Pinyin/i,
		});
		await hidePinyinBtn.click();
	});

	test("opens character popover dictionary on character click", async ({
		page,
	}) => {
		// Click character '我'
		const charBtn = page.getByRole("button", { name: /我/ }).first();
		await charBtn.click();

		await expect(page.getByText("I, me")).toBeVisible();
		await expect(page.getByText("wǒ").first()).toBeVisible();
		await expect(
			page.getByRole("button", {
				name: /Trace in Hanzi Studio|Practicar Trazo/i,
			}),
		).toBeVisible();
	});

	test("advances to next reading passage", async ({ page }) => {
		await expect(page.getByText("1 / 2")).toBeVisible();
		const nextBtn = page.getByRole("button", {
			name: /Next Passage|Siguiente Texto/i,
		});
		await nextBtn.click();

		await expect(page.getByText("2 / 2")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /一天的生活/i }),
		).toBeVisible();
	});
});
