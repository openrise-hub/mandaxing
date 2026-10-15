import { expect, test } from "@playwright/test";
import { blindSection, earTrainingPad, interceptAudioCdn } from "./helpers";

test("runs a blind ear-training round and records the response", async ({
	page,
}) => {
	await interceptAudioCdn(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Tones", exact: true }).click();

	await blindSection(page)
		.getByRole("button", { name: "Listen", exact: true })
		.click();

	const toneOne = earTrainingPad(page).getByRole("button", { name: /^Tone 1/ });
	await expect(toneOne).toBeEnabled();
	await toneOne.click();

	await expect(blindSection(page).getByText(/Correct|Try again/)).toBeVisible();
	await page.waitForTimeout(300);

	const count = await page.evaluate(async () => {
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("mandaxing");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		return await new Promise<number>((resolve, reject) => {
			const tx = db.transaction("discriminationTests", "readonly");
			const countRequest = tx.objectStore("discriminationTests").count();
			countRequest.onsuccess = () => resolve(countRequest.result);
			countRequest.onerror = () => reject(countRequest.error);
		});
	});

	expect(count).toBeGreaterThan(0);
});
