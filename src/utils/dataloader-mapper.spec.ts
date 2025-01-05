import { RelationMetadata, RelationType } from "../types/dataloader.types";
import { DataloaderMapper } from "./dataloader-mapper";

describe("DataloaderMapper", () => {
	it("should be defined", () => {
		expect(DataloaderMapper).toBeDefined();
	});

	it("should map entities correctly using one-to-many relation", () => {
		const mockKeys = ["key1", "key2"];
		const mockEntities = [
			{ id: 1, key: ["key1", "key3"] },
			{ id: 2, key: "key2" },
			{ id: 3, key: "key1" },
		];
		const metadata: RelationMetadata = {
			type: RelationType.OneToMany,
			where: "key",
			by: "id",
			on: "",
		};

		const result = DataloaderMapper.map(metadata, mockKeys, mockEntities);

		expect(result).toEqual([
			[
				{ id: 1, key: ["key1", "key3"] },
				{ id: 3, key: "key1" },
			],
			[{ id: 2, key: "key2" }],
		]);
	});

	it("should map entities correctly using one-to-one relation", () => {
		const mockKeys = ["key1", "key2"];
		const mockEntities = [
			{ id: 1, key: "key1" },
			{ id: 2, key: "key2" },
			{ id: 3, key: "key1" },
		];
		const metadata: RelationMetadata = {
			type: RelationType.OneToOne,
			where: "key",
			by: "id",
			on: "",
		};

		const result = DataloaderMapper.map(metadata, mockKeys, mockEntities);

		expect(result).toEqual([
			{ id: 1, key: "key1" },
			{ id: 2, key: "key2" },
		]);
	});

	it("should return empty arrays for keys with no matching entities in one-to-many relation", () => {
		const mockKeys = ["key4"];
		const mockEntities = [
			{ id: 1, key: ["key1", "key3"] },
			{ id: 2, key: "key2" },
			{ id: 3, key: "key1" },
		];
		const metadata: RelationMetadata = {
			type: RelationType.OneToMany,
			where: "key",
			by: "id",
			on: "",
		};

		const result = DataloaderMapper.map(metadata, mockKeys, mockEntities);

		expect(result).toEqual([[]]);
	});

	it("should return null for keys with no matching entities in one-to-one relation", () => {
		const mockKeys = ["key3"];
		const mockEntities = [
			{ id: 1, key: "key1" },
			{ id: 2, key: "key2" },
			{ id: 3, key: "key1" },
		];
		const metadata: RelationMetadata = {
			type: RelationType.OneToOne,
			where: "key",
			by: "id",
			on: "",
		};

		const result = DataloaderMapper.map(metadata, mockKeys, mockEntities);

		expect(result).toEqual([null]);
	});

	it("should resolve a nested path correctly", () => {
		const mockEntity = {
			nested: {
				data: {
					key: "value",
				},
			},
			arrayField: [{ key: "arrayValue1" }, { key: "arrayValue2" }],
		};
		const result = DataloaderMapper.resolvePath(mockEntity, "nested.data.key");
		expect(result).toBe("value");
	});

	it("should resolve a path containing an array correctly", () => {
		const mockEntity = {
			nested: {
				data: {
					key: "value",
				},
			},
			arrayField: [{ key: "arrayValue1" }, { key: "arrayValue2" }],
		};
		const result = DataloaderMapper.resolvePath(mockEntity, "arrayField.key");
		expect(result).toEqual(["arrayValue1", "arrayValue2"]);
	});

	it("should return undefined if path does not exist", () => {
		const mockEntity = {
			nested: {
				data: {
					key: "value",
				},
			},
			arrayField: [{ key: "arrayValue1" }, { key: "arrayValue2" }],
		};
		const result = DataloaderMapper.resolvePath(mockEntity, "nonexistent.path");
		expect(result).toBeUndefined();
	});
});
