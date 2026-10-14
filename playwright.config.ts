import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const audioFixture = path
	.join(process.cwd(), "tests", "fixtures", "audio", "sine-220hz.wav")
	.split(path.sep)
	.join("/");

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:4173",
		trace: "retain-on-failure",
		permissions: ["microphone"],
		launchOptions: {
			args: [
				"--use-fake-ui-for-media-stream",
				"--use-fake-device-for-media-stream",
				`--use-file-for-fake-audio-capture=${audioFixture}`,
				"--autoplay-policy=no-user-gesture-required",
			],
		},
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: process.env.CI
			? "pnpm build && pnpm preview"
			: "corepack pnpm build && corepack pnpm preview",
		url: "http://localhost:4173",
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
