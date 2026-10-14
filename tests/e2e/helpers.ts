import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

const audioFixture = readFileSync(
	path.join(process.cwd(), "tests", "fixtures", "audio", "sine-220hz.wav"),
);

export async function interceptAudioCdn(page: Page): Promise<void> {
	await page.route("https://cdn.jsdelivr.net/**", (route) =>
		route.fulfill({
			status: 200,
			contentType: "audio/wav",
			body: audioFixture,
		}),
	);
}

export async function blockAudioCdn(page: Page): Promise<void> {
	await page.route("https://cdn.jsdelivr.net/**", (route) =>
		route.fulfill({
			status: 404,
			contentType: "text/plain",
			body: "not found",
		}),
	);
}

export function blindSection(page: Page) {
	return page
		.locator("section", {
			has: page.getByRole("heading", { name: "Ear Training" }),
		})
		.first();
}

export function earTrainingPad(page: Page) {
	return page
		.locator("section", {
			has: page.getByRole("heading", { name: "Ear Training" }),
		})
		.last();
}
