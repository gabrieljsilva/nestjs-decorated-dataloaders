import { Type } from "@nestjs/common";
import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { AliasForReturnFn, DataloaderKey, RelationField, RelationMetadata, RelationNodeFn } from "../types/dataloader.types";
interface DataloaderMetadataContainerParams {
    relations?: AdjacencyGraph<RelationNodeFn, Map<RelationField, RelationMetadata>>;
    aliases?: Map<Type, AliasForReturnFn>;
    dataloaderHandlersMappedByKey?: Map<DataloaderKey, DataloaderHandlerMetadata>;
}
export declare class DataloaderMetadataContainer {
    private relations;
    private aliases;
    private dataloaderHandlersMappedByKey;
    constructor(args?: DataloaderMetadataContainerParams);
    start(args?: DataloaderMetadataContainerParams): void;
    AddRelationMetadata<Parent, Child>(parent: RelationNodeFn<Parent>, child: RelationNodeFn<Child>, field: string, metadata: RelationMetadata): void;
    resolveRelations(): AdjacencyGraph<Type<any>, Map<string, RelationMetadata<any, any>>>;
    setDataloaderHandler(key: DataloaderKey, provider: DataloaderHandlerMetadata): void;
    getDataloaderHandlers(): Map<string, DataloaderHandlerMetadata>;
    hasAlias(alias: Type): boolean;
    setAlias(target: Type, alias: AliasForReturnFn): void;
    resolveAliases(): Map<Type<any>, Type<any>>;
}
export {};
