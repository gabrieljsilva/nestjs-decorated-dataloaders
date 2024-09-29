import { type Type } from "@nestjs/common";
import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { DataloaderKey, RelationMetadata } from "../types/dataloader.types";
export declare class DataloaderMetadataService {
    private readonly aliases;
    private readonly dataloaderHandlersMappedByKey;
    private readonly relations;
    constructor(relations: AdjacencyGraph<Type, Map<string, RelationMetadata>>, aliases: Map<Type, Type>, dataloaderHandlersMappedByKey: Map<DataloaderKey, DataloaderHandlerMetadata>);
    getMetadata(parent: Type, child: Type): Map<string, RelationMetadata<any, any>>;
    getDataloaderHandler(key: DataloaderKey): DataloaderHandlerMetadata;
    getAlias(type: Type): Type<any>;
}
