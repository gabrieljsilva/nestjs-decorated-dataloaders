import { resolvePath } from "./resolve-path";

describe("resolvePath", () => {
	it("should return the correct value for simple properties in an object", () => {
		const entity = { a: { b: { c: 42 } } };
		expect(resolvePath(entity, "a.b.c")).toBe(42);
	});

	it("should return undefined for a non-existent path", () => {
		const entity = { a: { b: { c: 42 } } };
		expect(resolvePath(entity, "a.x.c")).toBeUndefined();
		expect(resolvePath(entity, "a.b.x")).toBeUndefined();
	});

	it("should access arrays in objects", () => {
		const entity = { a: [{ b: 1 }, { b: 2 }, { b: 3 }] };
		expect(resolvePath(entity, "a.b")).toEqual([1, 2, 3]);
	});

	it("should return undefined if no property in the array items is found", () => {
		const entity = { a: [{ x: 1 }, { x: 2 }, { x: 3 }] };
		expect(resolvePath(entity, "a.b")).toBeUndefined();
	});

	it("should ignore null or undefined items in arrays", () => {
		const entity = { a: [{ b: 1 }, null, undefined, { b: 2 }] };
		expect(resolvePath(entity, "a.b")).toEqual([1, 2]);
	});

	it("should return undefined for empty or invalid paths", () => {
		const entity = { a: { b: { c: 42 } } };
		expect(resolvePath(entity, "")).toBeUndefined();
		expect(resolvePath(undefined, "a.b")).toBeUndefined();
		expect(resolvePath(null, "a.b")).toBeUndefined();
	});

	it("should handle root-level properties", () => {
		const entity = { a: 42, b: "text" };
		expect(resolvePath(entity, "a")).toBe(42);
		expect(resolvePath(entity, "b")).toBe("text");
	});

	it("should return undefined if the root-level property does not exist", () => {
		const entity = { a: 42 };
		expect(resolvePath(entity, "b")).toBeUndefined();
	});

	it("should handle arrays at the root level", () => {
		const entity = [{ a: 1 }, { a: 2 }, { a: 3 }];
		expect(resolvePath(entity, "a")).toEqual([1, 2, 3]);
	});

	it("should return undefined for root-level arrays without the specified property", () => {
		const entity = [{ a: 1 }, { b: 2 }, { c: 3 }];
		expect(resolvePath(entity, "x")).toBeUndefined();
	});

	it("should return undefined when trying to access properties in empty arrays", () => {
		const entity = { a: [] };
		expect(resolvePath(entity, "a.b")).toBeUndefined();
	});

	it("should work with primitive values inside arrays", () => {
		const entity = { a: [1, 2, 3] };
		expect(resolvePath(entity, "a")).toEqual([1, 2, 3]);
	});

	it("should correctly handle paths ending in arrays", () => {
		const entity = { a: { b: [{ c: 1 }, { c: 2 }] } };
		expect(resolvePath(entity, "a.b.c")).toEqual([1, 2]);
	});

	it("should return undefined if the path tries to access properties of non-object values", () => {
		const entity = { a: { b: 42 } };
		expect(resolvePath(entity, "a.b.c")).toBeUndefined();
	});
});
