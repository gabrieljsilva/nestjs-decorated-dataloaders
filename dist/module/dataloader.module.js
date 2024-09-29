"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderModule = void 0;
const dataloader_metadata_container_1 = require("../utils/dataloader-metadata-container");
const cache_map_service_1 = require("./cache-map.service");
const dataloader_metadata_service_1 = require("./dataloader-metadata.service");
const dataloader_service_1 = require("./dataloader.service");
class DataloaderModule {
    static register(options) {
        const { global = false, dataloaderOptions = {} } = options || {};
        return {
            module: DataloaderModule,
            providers: [
                dataloader_service_1.DataloaderService,
                {
                    provide: dataloader_metadata_service_1.DataloaderMetadataService,
                    useFactory: () => {
                        const relations = dataloader_metadata_container_1.DataloaderMetadataContainer.resolveRelations();
                        const aliases = dataloader_metadata_container_1.DataloaderMetadataContainer.resolveAliases();
                        const dataloaderHandlers = dataloader_metadata_container_1.DataloaderMetadataContainer.getDataloaderHandlers();
                        return new dataloader_metadata_service_1.DataloaderMetadataService(relations, aliases, dataloaderHandlers);
                    },
                },
                {
                    provide: cache_map_service_1.CacheMapService,
                    useValue: new cache_map_service_1.CacheMapService(dataloaderOptions),
                },
            ],
            exports: [dataloader_service_1.DataloaderService],
            global: global,
            imports: [],
        };
    }
}
exports.DataloaderModule = DataloaderModule;
//# sourceMappingURL=dataloader.module.js.map