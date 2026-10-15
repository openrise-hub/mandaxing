import { expect, test } from "@playwright/test";
import { interceptAudioCdn } from "./helpers";

test("records the microphone input and shows an accuracy score", async ({
	page,
}) => {
	await interceptAudioCdn(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Tones", exact: true }).click();

	await page.getByRole("button", { name: "Record", exact: true }).click();
	await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();

	await page.waitForTimeout(800);
	await page.getByRole("button", { name: "Stop" }).click();

	await expect(page.getByText(/Accuracy: \d+%/)).toBeVisible();
});
