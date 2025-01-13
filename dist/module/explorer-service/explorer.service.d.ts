import { ModuleRef } from "@nestjs/core";
export declare class ExplorerService {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    findMetadataHandlerByName(handlerName: string): {
        repository: any;
        provider: import("../../types/dataloader.types").DataloaderHandlerMetadata;
    };
}
