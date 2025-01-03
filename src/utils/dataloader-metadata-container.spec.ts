import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { RelationMetadata, RelationType } from "../types/dataloader.types";
import { DataloaderMetadataContainer } from "./dataloader-metadata-container";

describe("DataloaderMetadataContainer", () => {
	let container: DataloaderMetadataContainer;

	beforeEach(() => {
		container = new DataloaderMetadataContainer();
	});

	it("should instantiate with default values", () => {
		expect(container).toBeDefined();
		expect(container.getDataloaderHandlers()).toBeDefined();
		expect(container.getDataloaderHandlers().size).toBe(0);
	});

	it("should add and update relations metadata", () => {
		const mockParent = () => class Parent {};
		const mockChild = () => class Child {};
		const field = "exampleField";
		const metadata = new RelationMetadata({
			type: RelationType.OneToMany,
			by: "field1",
			where: "field2",
			on: "handler",
		});

		container.AddRelationMetadata(mockParent, mockChild, field, metadata);

		const relationsGraph = (container as any).relations;
		const edges = relationsGraph.getEdges(mockParent)?.get(mockChild);

		expect(edges).toBeDefined();
		expect(edges?.get(field)).toEqual(metadata);
	});

	it("should resolve relations by calling vertex functions", () => {
		const parent = class Parent {};
		const child = class Child {};

		const field = "exampleField";
		const metadata = new RelationMetadata({
			type: RelationType.OneToMany,
			by: "field1",
			where: "field2",
			on: "handler",
		});

		container.AddRelationMetadata(
			() => parent,
			() => child,
			field,
			metadata,
		);

		const resolvedRelations = container.resolveRelations();

		const resolvedEdges = resolvedRelations.getEdges(parent)?.get(child);

		expect(resolvedEdges).toBeDefined();
		expect(resolvedEdges?.get(field)).toEqual(metadata);
	});

	it("should set DataloaderHandler if key does not exist", () => {
		const mockHandler = new DataloaderHandlerMetadata(class Provider {}, "exampleField");

		container.setDataloaderHandler("exampleKey", mockHandler);

		const handlers = container.getDataloaderHandlers();

		expect(handlers.size).toBe(1);
		expect(handlers.get("exampleKey")).toEqual(mockHandler);
	});

	it("should throw an error if DataloaderHandler key already exists", () => {
		const mockHandler = new DataloaderHandlerMetadata(class Provider {}, "exampleField");
		container.setDataloaderHandler("exampleKey", mockHandler);

		expect(() => container.setDataloaderHandler("exampleKey", mockHandler)).toThrowError(
			"Dataloader provider with key exampleKey already exists",
		);
	});

	it("should set alias mapping if it does not exist", () => {
		const mockTarget = class Target {};
		const mockAlias: any = () => class Alias {};

		container.setAlias(mockTarget, mockAlias);

		const aliases = (container as any).aliases;

		expect(aliases.has(mockTarget)).toBe(true);
		expect(aliases.get(mockTarget)).toBe(mockAlias);
	});

	it("should throw an error if alias already exists", () => {
		const mockTarget = class Target {};
		const mockAlias: any = () => class Alias {};
		container.setAlias(mockTarget, mockAlias);

		expect(() => container.setAlias(mockTarget, mockAlias)).toThrowError(`Alias for ${mockTarget} already exists`);
	});

	it("should resolve aliases to actual types", () => {
		const mockTarget = class Target {};
		const resolvedAlias = class ResolvedAlias {};
		const mockAlias = vi.fn(() => resolvedAlias);

		container.setAlias(mockTarget, mockAlias);

		const aliases = container.resolveAliases();

		expect(aliases.size).toBe(1);
		expect(aliases.get(mockTarget)).toBe(resolvedAlias);
		expect(mockAlias).toHaveBeenCalled();
	});

	it("should return true if alias exists", () => {
		const mockTarget = class Target {};
		const mockAlias: any = () => class Alias {};
		container.setAlias(mockTarget, mockAlias);

		expect(container.hasAlias(mockTarget)).toBe(true);
	});

	it("should return false if alias does not exist", () => {
		const mockTarget = class Target {};
		expect(container.hasAlias(mockTarget)).toBe(false);
	});
});
