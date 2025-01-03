import { Type } from "@nestjs/common";
import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import {
	AliasForReturnFn,
	DataloaderKey,
	RelationField,
	RelationMetadata,
	RelationNodeFn,
} from "../types/dataloader.types";

interface DataloaderMetadataContainerParams {
	relations?: AdjacencyGraph<RelationNodeFn, Map<RelationField, RelationMetadata>>;
	aliases?: Map<Type, AliasForReturnFn>;
	dataloaderHandlersMappedByKey?: Map<DataloaderKey, DataloaderHandlerMetadata>;
}

export class DataloaderMetadataContainer {
	private relations: AdjacencyGraph<RelationNodeFn, Map<RelationField, RelationMetadata>>;
	private aliases: Map<Type, AliasForReturnFn>;
	private dataloaderHandlersMappedByKey: Map<DataloaderKey, DataloaderHandlerMetadata>;

	constructor(args?: DataloaderMetadataContainerParams) {
		this.start(args);
	}

	start(args?: DataloaderMetadataContainerParams) {
		const { relations, aliases, dataloaderHandlersMappedByKey } = args || {};
		this.relations = relations ?? new AdjacencyGraph<RelationNodeFn, Map<RelationField, RelationMetadata>>();
		this.aliases = aliases ?? new Map<Type, AliasForReturnFn>();
		this.dataloaderHandlersMappedByKey =
			dataloaderHandlersMappedByKey ?? new Map<DataloaderKey, DataloaderHandlerMetadata>();
	}

	AddRelationMetadata<Parent, Child>(
		parent: RelationNodeFn<Parent>,
		child: RelationNodeFn<Child>,
		field: string,
		metadata: RelationMetadata,
	) {
		const parentClass = parent;
		const childClass = child;
		const relationMetadata =
			this.relations.getEdges(parentClass)?.get(childClass) ?? new Map<RelationField, RelationMetadata>();
		relationMetadata.set(field, metadata);
		this.relations.addEdge(parentClass, childClass, relationMetadata);
	}

	// Initially, the relationships are defined as functions that return the corresponding types.
	// On module initializes, these relationships are resolved to their actual types rather than remaining as functions.
	// This approach is used to mitigate circular dependency issues by using lazy loading technique for entities.
	resolveRelations() {
		return this.relations.transform(
			(vertex) => vertex(),
			(edge) => edge,
		);
	}

	setDataloaderHandler(key: DataloaderKey, provider: DataloaderHandlerMetadata) {
		if (this.dataloaderHandlersMappedByKey.has(key)) {
			throw new Error(`Dataloader provider with key ${key} already exists`);
		}
		this.dataloaderHandlersMappedByKey.set(key, provider);
	}

	getDataloaderHandlers() {
		return this.dataloaderHandlersMappedByKey;
	}

	hasAlias(alias: Type): boolean {
		return this.aliases.has(alias);
	}

	setAlias(target: Type, alias: AliasForReturnFn) {
		if (this.hasAlias(target)) {
			throw new Error(`Alias for ${target} already exists`);
		}

		this.aliases.set(target, alias);
	}

	resolveAliases() {
		const aliases = new Map<Type, Type>();
		for (const [key, aliasReturnFn] of this.aliases.entries()) {
			aliases.set(key, aliasReturnFn() as Type);
		}
		return aliases;
	}
}
