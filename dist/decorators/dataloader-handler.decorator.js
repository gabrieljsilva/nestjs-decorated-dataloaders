"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderHandler = DataloaderHandler;
const dataloader_handler_metadata_1 = require("../types/dataloader-handler-metadata");
const dataloader_metadata_container_1 = require("../utils/dataloader-metadata-container");
function DataloaderHandler(key) {
    return (target, propertyKey) => {
        dataloader_metadata_container_1.DataloaderMetadataContainer.setDataloaderHandler(key || propertyKey, new dataloader_handler_metadata_1.DataloaderHandlerMetadata(target.constructor, propertyKey));
    };
}
//# sourceMappingURL=dataloader-handler.decorator.js.map