import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("exports a JSON backup and restores it", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Daily Review" }).click();
	await expect(page.getByText("Due now: 35")).toBeVisible();

	await page.getByRole("button", { name: "Show answer" }).click();
	await page.keyboard.press("Digit3");
	await expect(page.getByText("Due now: 34")).toBeVisible();
	await page.getByRole("button", { name: "Show answer" }).click();
	await page.keyboard.press("Digit3");
	await expect(page.getByText("Due now: 33")).toBeVisible();

	const [download] = await Promise.all([
		page.waitForEvent("download"),
		page.getByRole("button", { name: "Export JSON" }).click(),
	]);
	const exportPath = await download.path();
	expect(exportPath).not.toBeNull();
	if (!exportPath) return;
	const payload = JSON.parse(readFileSync(exportPath, "utf8")) as Record<
		string,
		unknown
	>;
	expect(payload.version).toBe(2);
	expect((payload.reviews as unknown[]).length).toBe(2);
	expect((payload.cards as unknown[]).length).toBe(35);

	await page.getByRole("button", { name: "Show answer" }).click();
	await page.keyboard.press("Digit3");
	await expect(page.getByText("Due now: 32")).toBeVisible();

	await page.locator('input[type="file"]').setInputFiles(exportPath);
	await expect(page.getByText("Backup restored")).toBeVisible();

	await page.reload();
	await page.getByRole("button", { name: "Daily Review" }).click();
	await expect(page.getByText("Due now: 33")).toBeVisible();

	const reviewCount = await page.evaluate(async () => {
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("mandaxing");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		return await new Promise<number>((resolve, reject) => {
			const transaction = db.transaction("reviews", "readonly");
			const count = transaction.objectStore("reviews").count();
			count.onsuccess = () => resolve(count.result);
			count.onerror = () => reject(count.error);
		});
	});
	expect(reviewCount).toBe(2);
});
