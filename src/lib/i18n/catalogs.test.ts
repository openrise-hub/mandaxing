import { describe, expect, it } from "vitest";
import { en } from "./locales/en";
import { es } from "./locales/es";

type JsonTree = string | { [key: string]: JsonTree };

function collectLeaves(node: JsonTree, prefix = ""): Array<[string, string]> {
	if (typeof node === "string") return [[prefix, node]];
	return Object.entries(node).flatMap(([key, value]) =>
		collectLeaves(value, prefix ? `${prefix}.${key}` : key),
	);
}

const enLeaves = collectLeaves(en as unknown as JsonTree);
const esLeaves = collectLeaves(es as unknown as JsonTree);

describe("translation catalogs", () => {
	it("expose identical key sets", () => {
		expect(esLeaves.map(([path]) => path).sort()).toEqual(
			enLeaves.map(([path]) => path).sort(),
		);
	});

	it("contain no empty values", () => {
		for (const [path, value] of [...enLeaves, ...esLeaves]) {
			expect(value.trim().length, `${path} must not be empty`).toBeGreaterThan(
				0,
			);
		}
	});

	it("share the same brand name", () => {
		expect(es.common.appName).toBe(en.common.appName);
	});
});
