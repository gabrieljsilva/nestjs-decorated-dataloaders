"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderModule = void 0;
const utils_1 = require("../../utils");
const cache_map_service_1 = require("../cache-map/cache-map.service");
const dataloader_service_1 = require("../dataloader-service/dataloader.service");
const explorer_service_1 = require("../explorer-service/explorer.service");
class DataloaderModule {
    static forRoot(options = {}) {
        return {
            module: DataloaderModule,
            providers: [
                dataloader_service_1.DataloaderService,
                explorer_service_1.ExplorerService,
                {
                    provide: cache_map_service_1.CacheMapService,
                    useValue: new cache_map_service_1.CacheMapService(options),
                },
            ],
            exports: [dataloader_service_1.DataloaderService],
            global: true,
            imports: [],
        };
    }
    async onModuleInit() {
        utils_1.LazyMetadataContainer.loadRelationshipMetadata();
        utils_1.LazyMetadataContainer.loadAliasMetadata();
    }
}
exports.DataloaderModule = DataloaderModule;
//# sourceMappingURL=dataloader.module.js.map