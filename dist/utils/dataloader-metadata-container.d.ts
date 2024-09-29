import { Type } from "@nestjs/common";
import { AdjacencyGraph } from "../types/adjacency-graph";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { AliasForReturnFn, DataloaderKey, RelationMetadata, RelationNodeFn } from "../types/dataloader.types";
export declare class DataloaderMetadataContainer {
    private static readonly relations;
    private static readonly aliases;
    private static readonly dataloaderHandlersMappedByKey;
    static AddRelationMetadata<Parent, Child>(parent: RelationNodeFn<Parent>, child: RelationNodeFn<Child>, field: string, metadata: RelationMetadata): void;
    static resolveRelations(): AdjacencyGraph<Type<any>, Map<string, RelationMetadata<any, any>>>;
    static setDataloaderHandler(key: DataloaderKey, provider: DataloaderHandlerMetadata): void;
    static getDataloaderHandlers(): Map<string, DataloaderHandlerMetadata>;
    static hasAlias(alias: Type): boolean;
    static setAlias(target: Type, alias: AliasForReturnFn): void;
    static resolveAliases(): Map<Type<any>, Type<any>>;
}
