"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderHandler = DataloaderHandler;
const constants_1 = require("../constants");
const dataloader_handler_metadata_1 = require("../types/dataloader-handler-metadata");
function DataloaderHandler(key) {
    return (target, propertyKey) => {
        constants_1.dataloaderMetadata.setDataloaderHandler(key || propertyKey, new dataloader_handler_metadata_1.DataloaderHandlerMetadata(target.constructor, propertyKey));
    };
}
//# sourceMappingURL=dataloader-handler.decorator.js.map