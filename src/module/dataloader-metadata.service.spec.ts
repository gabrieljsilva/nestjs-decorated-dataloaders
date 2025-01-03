import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { RelationMetadata, RelationType } from "../types/dataloader.types";
import { DataloaderMetadataService } from "./dataloader-metadata.service";

describe("DataloaderMetadataService", () => {
	let service: DataloaderMetadataService;
	let mockRelations: AdjacencyGraph<any, Map<string, RelationMetadata>>;
	let mockAliases: Map<any, any>;
	let mockDataloaderHandlersMappedByKey: Map<string, DataloaderHandlerMetadata>;

	beforeEach(() => {
		mockRelations = new AdjacencyGraph();
		mockAliases = new Map();
		mockDataloaderHandlersMappedByKey = new Map();

		service = new DataloaderMetadataService(mockRelations, mockAliases, mockDataloaderHandlersMappedByKey);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should return metadata for a valid parent-child pair", () => {
		const parent = class Parent {};
		const child = class Child {};
		const field = "exampleField";
		const metadata = new RelationMetadata({
			type: RelationType.OneToOne,
			by: "field1",
			where: "field2",
			on: "handler",
		});

		const relationMap = new Map<string, RelationMetadata>([[field, metadata]]);
		mockRelations.addEdge(parent, child, relationMap);

		const result = service.getMetadata(parent, child);

		expect(result).toBeDefined();
		expect(result?.get(field)).toEqual(metadata);
	});

	it("should return undefined for an invalid parent-child pair", () => {
		const nonExistentParent = class NonExistentParent {};
		const nonExistentChild = class NonExistentChild {};

		const result = service.getMetadata(nonExistentParent, nonExistentChild);

		expect(result).toBeUndefined();
	});

	it("should return the correct dataloader handler for a valid key", () => {
		const dataloaderHandler = new DataloaderHandlerMetadata(class MockHandler {}, "exampleField");
		mockDataloaderHandlersMappedByKey.set("exampleKey", dataloaderHandler);

		const result = service.getDataloaderHandler("exampleKey");

		expect(result).toBeDefined();
		expect(result).toEqual(dataloaderHandler);
	});

	it("should return undefined for an invalid key", () => {
		const result = service.getDataloaderHandler("invalidKey");

		expect(result).toBeUndefined();
	});

	it("should return the correct alias for a known type", () => {
		const mockType = class MockType {};
		const mockAlias = class MockAlias {};
		mockAliases.set(mockType, mockAlias);

		const result = service.getAlias(mockType);

		expect(result).toBeDefined();
		expect(result).toEqual(mockAlias);
	});

	it("should return undefined for an unknown type", () => {
		const unknownType = class Unknown {};

		const result = service.getAlias(unknownType);

		expect(result).toBeUndefined();
	});
});
