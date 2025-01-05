import { Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { JoinProperty } from "../types/dataloader.types";
import { CacheMapService } from "./cache-map.service";
import { DataloaderMetadataService } from "./dataloader-metadata.service";
interface LoadParams<Parent> {
    from: Type;
    field?: string;
    by: [Parent, ...any];
}
export declare class DataloaderService {
    private readonly moduleRef;
    private readonly dataloaderMetadataService;
    private readonly cacheMapService;
    private readonly dataloadersMappedByParentField;
    constructor(moduleRef: ModuleRef, dataloaderMetadataService: DataloaderMetadataService, cacheMapService: CacheMapService);
    load<Parent, Child>(child: Type<Child>, params: LoadParams<Parent>): Promise<Child>;
    load<Parent, Child>(child: [Type<Child>], params: LoadParams<Parent>): Promise<Child[]>;
    prime<Parent, Child>(key: JoinProperty, value: Child, params: LoadParams<Parent>): void;
    clear<Parent>(key: JoinProperty, params: LoadParams<Parent>): void;
    clearAll<Parent>(params: LoadParams<Parent>): void;
    private extractMetadata;
    private getOrCreateDataloader;
    private createDataloader;
}
export {};
