import { Injectable, type Type } from "@nestjs/common";
import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { DataloaderKey, RelationMetadata } from "../types/dataloader.types";

/**
 * Intermediate Service between DataloaderMetadataContainer and Nest.js DI Container;
 * It provides a way to access the metadata stored in the DataloaderMetadataContainer, inside the DI Container.
 */
@Injectable()
export class DataloaderMetadataService {
	private readonly aliases: Map<Type, Type>;
	private readonly dataloaderHandlersMappedByKey: Map<DataloaderKey, DataloaderHandlerMetadata>;
	private readonly relations: AdjacencyGraph<Type, Map<string, RelationMetadata>>;

	constructor(
		relations: AdjacencyGraph<Type, Map<string, RelationMetadata>>,
		aliases: Map<Type, Type>,
		dataloaderHandlersMappedByKey: Map<DataloaderKey, DataloaderHandlerMetadata>,
	) {
		this.relations = relations;
		this.aliases = aliases;
		this.dataloaderHandlersMappedByKey = dataloaderHandlersMappedByKey;
	}

	getMetadata(parent: Type, child: Type) {
		return this.relations.getEdges(parent)?.get(child);
	}

	getDataloaderHandler(key: DataloaderKey) {
		return this.dataloaderHandlersMappedByKey.get(key);
	}

	getAlias(type: Type) {
		return this.aliases.get(type);
	}
}
