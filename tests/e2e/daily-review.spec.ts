import { expect, test } from "@playwright/test";

test("grades a card and shrinks the due queue", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Daily Review", exact: true }).click();
	await expect(page.getByText("Due now: 35")).toBeVisible();
	await expect(page.getByText("我")).toBeVisible();

	await page.getByRole("button", { name: "Show answer" }).click();
	await expect(page.getByText("wǒ")).toBeVisible();
	await expect(page.getByText("I, me")).toBeVisible();
	await page.keyboard.press("Digit3");

	await expect(page.getByText("Due now: 34")).toBeVisible();
	await expect(page.getByText("你")).toBeVisible();

	const stored = await page.evaluate(async () => {
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("mandaxing");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const reviews = await new Promise<number>((resolve, reject) => {
			const transaction = db.transaction("reviews", "readonly");
			const count = transaction.objectStore("reviews").count();
			count.onsuccess = () => resolve(count.result);
			count.onerror = () => reject(count.error);
		});
		const reps = await new Promise<number>((resolve, reject) => {
			const transaction = db.transaction("cards", "readonly");
			const request = transaction
				.objectStore("cards")
				.index("itemId")
				.get("wb1_wo");
			request.onsuccess = () =>
				resolve((request.result as { reps?: number } | undefined)?.reps ?? -1);
			request.onerror = () => reject(request.error);
		});
		return { reviews, reps };
	});

	expect(stored.reviews).toBe(1);
	expect(stored.reps).toBe(1);
});
