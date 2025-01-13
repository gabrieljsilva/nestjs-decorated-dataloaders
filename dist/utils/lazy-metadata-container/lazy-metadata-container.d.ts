import { Type } from "@nestjs/common";
import { AliasForReturnFn, DataloaderHandlerMetadata, HandlerKey, LoadedRelationships, Relationship } from "../../types/dataloader.types";
export declare class LazyMetadataContainer {
    private static unloadedRelationships;
    private static unloadedAliases;
    static loadedRelationships: LoadedRelationships;
    static loadedAliases: Map<Type, Type | Function>;
    static dataloaderHandlers: Map<HandlerKey, DataloaderHandlerMetadata>;
    static addRelationshipMetadata<Parent, Child>(params: Relationship<Parent, Child>): void;
    static addAliasMetadata(alias: AliasForReturnFn, type: Type): void;
    static addDataloaderHandlerMetadata(key: HandlerKey, metadata: DataloaderHandlerMetadata): void;
    static loadRelationshipMetadata(): void;
    static loadAliasMetadata(): void;
    /**
     * Removes all items or resets the current state to its initial state.
     * Used in tests scenarios
     */
    static clear(): void;
}
