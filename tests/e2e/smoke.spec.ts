import { expect, test } from "@playwright/test";
import { blockAudioCdn, interceptAudioCdn } from "./helpers";

test("loads the lab and switches between all three modes", async ({ page }) => {
	await interceptAudioCdn(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Tone Lab", exact: true }).click();

	await expect(
		page.getByRole("heading", { name: "Tone and Pinyin Lab" }),
	).toBeVisible();

	await page.getByRole("button", { name: "Tone Pairs" }).click();
	await expect(page.getByText("jīntiān")).toBeVisible();

	await page.getByRole("button", { name: "Minimal Pairs" }).click();
	await expect(page.getByText("bā / pā")).toBeVisible();
});

test("persists the language choice across reloads", async ({ page }) => {
	await interceptAudioCdn(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Tone Lab", exact: true }).click();

	await page.getByRole("button", { name: "es", exact: true }).click();
	await expect(
		page.getByRole("heading", { name: "Laboratorio de Tonos y Pinyin" }),
	).toBeVisible();

	await page.reload();
	await page
		.getByRole("button", { name: "Laboratorio de tonos", exact: true })
		.click();
	await expect(
		page.getByRole("heading", { name: "Laboratorio de Tonos y Pinyin" }),
	).toBeVisible();
});

test("disables playback honestly when the CDN has no audio", async ({
	page,
}) => {
	await blockAudioCdn(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Tone Lab", exact: true }).click();

	const controlListen = page
		.getByRole("button", { name: "Listen", exact: true })
		.first();
	await controlListen.click();
	await expect(page.getByText("Audio unavailable").first()).toBeVisible();
	await expect(controlListen).toBeDisabled();
});
