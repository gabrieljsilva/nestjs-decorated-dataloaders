"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderHandler = DataloaderHandler;
const utils_1 = require("../../utils");
/**
 * Decorator used to define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
function DataloaderHandler(key) {
    return (target, propertyKey) => {
        const metadata = {
            provide: target.constructor,
            field: propertyKey,
        };
        utils_1.LazyMetadataContainer.addDataloaderHandlerMetadata(key || propertyKey, metadata);
    };
}
//# sourceMappingURL=dataloader-handler.decorator.js.map