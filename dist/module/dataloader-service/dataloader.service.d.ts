import { LoadParams, PropertyType } from "../../types/dataloader.types";
import { CacheMapService } from "../cache-map";
import { ExplorerService } from "../explorer-service";
/**
 * This service allows you to load data from a provider using a dataloader.
 * A Dataloader instance is created for each relation and for each request.
 */
export declare class DataloaderService {
    private readonly explorerService;
    private readonly cacheMapService;
    private readonly dataloadersMappedByParentField;
    constructor(explorerService: ExplorerService, cacheMapService: CacheMapService);
    load<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>): Promise<PropertyType<Parent, Field>>;
    loadMany<Parent, Field extends keyof Parent>(params: Omit<LoadParams<Parent, Field>, "data"> & {
        data: Parent[];
    }): Promise<Array<PropertyType<Parent, Field>>>;
    prime<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>, value: PropertyType<Parent, Field>): void;
    clear<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>): void;
    clearAll<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>): void;
    private extractMetadata;
    private getDataloaderOrThrowError;
    private getOrCreateDataloader;
    private createDataloader;
}
