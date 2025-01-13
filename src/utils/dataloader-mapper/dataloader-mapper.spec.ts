import { JoinProperty, LoadedRelationship, RelationType } from "../../types/dataloader.types";
import { DataloaderMapper } from "./dataloader-mapper";

describe("DataloaderMapper", () => {
	const metadataOneToOne: LoadedRelationship = {
		type: RelationType.OneToOne,
		parentKey: "id",
		key: "id",
		handler: "handler",
		parent: class {},
		child: class {},
	};

	const metadataOneToMany: LoadedRelationship = {
		type: RelationType.OneToMany,
		parentKey: "tags",
		key: "id",
		handler: "handler",
		parent: class {},
		child: class {},
	};

	it("should handle one-to-one relationship with matching keys (simple objects)", () => {
		const keys: Array<JoinProperty> = [1, 2, 3];
		const entities = [
			{ id: 1, name: "Entity1" },
			{ id: 2, name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadataOneToOne, keys, entities);

		expect(result).toEqual([{ id: 1, name: "Entity1" }, { id: 2, name: "Entity2" }, null]);
	});

	it("should handle one-to-one relationship with no matching keys", () => {
		const keys: Array<JoinProperty> = [4, 5];
		const entities = [
			{ id: 1, name: "Entity1" },
			{ id: 2, name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadataOneToOne, keys, entities);

		expect(result).toEqual([null, null]);
	});

	it("should handle one-to-many relationship with matching keys (arrays)", () => {
		const keys: Array<JoinProperty> = [1, 2, 3];
		const entities = [
			{ id: 1, tags: [1, 2], name: "Entity1" },
			{ id: 2, tags: [2, 3], name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadataOneToMany, keys, entities);

		expect(result).toEqual([
			[{ id: 1, tags: [1, 2], name: "Entity1" }],
			[
				{ id: 1, tags: [1, 2], name: "Entity1" },
				{ id: 2, tags: [2, 3], name: "Entity2" },
			],
			[{ id: 2, tags: [2, 3], name: "Entity2" }],
		]);
	});

	it("should handle one-to-many relationship with no matching keys", () => {
		const keys: Array<JoinProperty> = [4, 5];
		const entities = [
			{ id: 1, tags: [1, 2], name: "Entity1" },
			{ id: 2, tags: [2, 3], name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadataOneToMany, keys, entities);

		expect(result).toEqual([[], []]);
	});

	it("should handle nested objects in one-to-one relationship", () => {
		const metadata: LoadedRelationship = {
			...metadataOneToOne,
			parentKey: "nested.id",
		};
		const keys: Array<JoinProperty> = [1, 2];
		const entities = [
			{ nested: { id: 1 }, name: "Entity1" },
			{ nested: { id: 2 }, name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadata, keys, entities);

		expect(result).toEqual([
			{ nested: { id: 1 }, name: "Entity1" },
			{ nested: { id: 2 }, name: "Entity2" },
		]);
	});

	it("should handle nested arrays in one-to-many relationship", () => {
		const metadata: LoadedRelationship = {
			...metadataOneToMany,
			parentKey: "nested.tags",
		};
		const keys: Array<JoinProperty> = [1, 2, 3];
		const entities = [
			{ nested: { tags: [1, 2] }, name: "Entity1" },
			{ nested: { tags: [2, 3] }, name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadata, keys, entities);

		expect(result).toEqual([
			[{ nested: { tags: [1, 2] }, name: "Entity1" }],
			[
				{ nested: { tags: [1, 2] }, name: "Entity1" },
				{ nested: { tags: [2, 3] }, name: "Entity2" },
			],
			[{ nested: { tags: [2, 3] }, name: "Entity2" }],
		]);
	});

	it("should handle scenarios where parentKey resolves to undefined", () => {
		const keys: Array<JoinProperty> = [1, 2];
		const entities = [
			{ id: 1, name: "Entity1" },
			{ id: undefined, name: "Entity2" },
		];

		const result = DataloaderMapper.map(metadataOneToOne, keys, entities);

		expect(result).toEqual([{ id: 1, name: "Entity1" }, null]);
	});

	it("should handle scenarios where parentKey does not exist in entities", () => {
		const metadata: LoadedRelationship = {
			...metadataOneToOne,
			parentKey: "nonExistentKey",
		};
		const keys: Array<JoinProperty> = [1, 2];
		const entities = [{ id: 1, name: "Entity1" }];

		const result = DataloaderMapper.map(metadata, keys, entities);

		expect(result).toEqual([null, null]);
	});

	it("should handle empty entities array", () => {
		const keys: Array<JoinProperty> = [1, 2];
		const entities: Array<unknown> = [];

		const result = DataloaderMapper.map(metadataOneToOne, keys, entities);

		expect(result).toEqual([null, null]);
	});

	it("should handle empty keys array", () => {
		const keys: Array<JoinProperty> = [];
		const entities = [{ id: 1, name: "Entity1" }];

		const result = DataloaderMapper.map(metadataOneToOne, keys, entities);

		expect(result).toEqual([]);
	});

	it("should throw a descriptive error if entities parameter is null", () => {
		const keys = [1, 2];
		const entities = null as unknown as Array<unknown>;
		expect(() => DataloaderMapper.map(metadataOneToOne, keys, entities)).toThrowError(
			"DataloaderMapper: 'entities' parameter must be an array but received null",
		);
	});

	it("should throw a descriptive error if entities parameter is undefined", () => {
		const keys = [1, 2];
		const entities = undefined as unknown as Array<unknown>;
		expect(() => DataloaderMapper.map(metadataOneToOne, keys, entities)).toThrowError(
			"DataloaderMapper: 'entities' parameter must be an array but received undefined",
		);
	});

	it("should throw a descriptive error if entities parameter is not an array", () => {
		const keys = [1, 2];
		const entities = {} as unknown as Array<unknown>;
		expect(() => DataloaderMapper.map(metadataOneToOne, keys, entities)).toThrowError(
			"DataloaderMapper: 'entities' parameter must be an array but received object",
		);
	});
});
