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

export class DataloaderMetadataContainer {
	private static readonly relations = new AdjacencyGraph<RelationNodeFn, Map<RelationField, RelationMetadata>>();
	private static readonly aliases = new Map<Type, AliasForReturnFn>();
	private static readonly dataloaderHandlersMappedByKey = new Map<DataloaderKey, DataloaderHandlerMetadata>();

	static AddRelationMetadata<Parent, Child>(
		parent: RelationNodeFn<Parent>,
		child: RelationNodeFn<Child>,
		field: string,
		metadata: RelationMetadata,
	) {
		let relationMetadata = DataloaderMetadataContainer.relations.getEdges(parent)?.get(child);
		relationMetadata ||= new Map<RelationField, RelationMetadata>([[field, metadata]]);
		DataloaderMetadataContainer.relations.addEdge(parent, child, relationMetadata);
	}

	// Initially, the relationships are defined as functions that return the corresponding types.
	// On module initializes, these relationships are resolved to their actual types rather than remaining as functions.
	// This approach is used to mitigate circular dependency issues by using lazy loading technique for entities.
	static resolveRelations() {
		return DataloaderMetadataContainer.relations.transform(
			(vertex) => vertex(),
			(edge) => edge,
		);
	}

	static setDataloaderHandler(key: DataloaderKey, provider: DataloaderHandlerMetadata) {
		if (DataloaderMetadataContainer.dataloaderHandlersMappedByKey.has(key)) {
			throw new Error(`Dataloader provider with key ${key} already exists`);
		}
		DataloaderMetadataContainer.dataloaderHandlersMappedByKey.set(key, provider);
	}

	static getDataloaderHandlers() {
		return DataloaderMetadataContainer.dataloaderHandlersMappedByKey;
	}

	static hasAlias(alias: Type): boolean {
		return DataloaderMetadataContainer.aliases.has(alias);
	}

	static setAlias(target: Type, alias: AliasForReturnFn) {
		if (DataloaderMetadataContainer.hasAlias(target)) {
			throw new Error(`Alias for ${target} already exists`);
		}

		DataloaderMetadataContainer.aliases.set(target, alias);
	}

	static resolveAliases() {
		const aliases = new Map<Type, Type>();
		for (const [key, aliasReturnFn] of DataloaderMetadataContainer.aliases.entries()) {
			aliases.set(key, aliasReturnFn() as Type);
		}
		return aliases;
	}
}
