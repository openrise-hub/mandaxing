import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const hanziFixture = readFileSync(
	path.join(process.cwd(), "tests", "fixtures", "hanzi", "stroke-fixture.json"),
);

test.beforeEach(async ({ page }) => {
	await page.route(
		"https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/**",
		(route) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: hanziFixture,
			}),
	);
	await page.goto("/");
	await page.getByRole("button", { name: "Hanzi Studio" }).click();
});

test("accepts a trace along the guide and marks the character mastered", async ({
	page,
}) => {
	const canvas = page.getByRole("img", { name: "什" });
	await expect(canvas).toBeVisible();
	const box = await canvas.boundingBox();
	expect(box).not.toBeNull();
	if (!box) return;
	const toScreen = (x: number, y: number) => ({
		x: box.x + (x / 1024) * box.width,
		y: box.y + (y / 1024) * box.height,
	});
	const start = toScreen(100, 500);
	const end = toScreen(900, 500);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(end.x, end.y, { steps: 20 });
	await page.mouse.up();
	await expect(page.getByText("Strokes 1/1")).toBeVisible();
	await expect(page.getByText("Completed cleanly")).toBeVisible();
});

test("rejects a trace that does not start at the stroke beginning", async ({
	page,
}) => {
	const canvas = page.getByRole("img", { name: "什" });
	await expect(canvas).toBeVisible();
	const box = await canvas.boundingBox();
	expect(box).not.toBeNull();
	if (!box) return;
	const toScreen = (x: number, y: number) => ({
		x: box.x + (x / 1024) * box.width,
		y: box.y + (y / 1024) * box.height,
	});
	const start = toScreen(900, 100);
	const end = toScreen(900, 900);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(end.x, end.y, { steps: 20 });
	await page.mouse.up();
	await expect(
		page.getByText("Start at the beginning of the stroke"),
	).toBeVisible();
	await expect(page.getByText("Strokes 0/1")).toBeVisible();
});
