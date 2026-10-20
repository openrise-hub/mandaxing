import { describe, expect, it } from "vitest";
import SectionHeader from "#lib/components/SectionHeader.svelte";

describe("SectionHeader component", () => {
	it("exports SectionHeader component definition", () => {
		expect(SectionHeader).toBeDefined();
	});
});
