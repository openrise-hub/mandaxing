import { beforeEach, describe, expect, it } from "vitest";
import HomeDashboard from "#lib/components/HomeDashboard.svelte";
import SettingsView from "#lib/components/SettingsView.svelte";
import { appView } from "#lib/state/app-view.svelte";

describe("Home Dashboard and View Navigation", () => {
	beforeEach(() => {
		appView.set("dashboard");
	});

	it("exports HomeDashboard and SettingsView components", () => {
		expect(HomeDashboard).toBeDefined();
		expect(SettingsView).toBeDefined();
	});

	it("initializes with dashboard as default view", () => {
		expect(appView.current).toBe("dashboard");
	});

	it("transitions to study views and returns to dashboard", () => {
		appView.set("lab");
		expect(appView.current).toBe("lab");

		appView.set("studio");
		expect(appView.current).toBe("studio");

		appView.set("sentences");
		expect(appView.current).toBe("sentences");

		appView.set("matrix");
		expect(appView.current).toBe("matrix");

		appView.set("review");
		expect(appView.current).toBe("review");

		appView.set("reader");
		expect(appView.current).toBe("reader");

		appView.set("settings");
		expect(appView.current).toBe("settings");

		appView.set("dashboard");
		expect(appView.current).toBe("dashboard");
	});
});
