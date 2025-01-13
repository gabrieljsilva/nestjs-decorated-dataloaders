"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasFor = AliasFor;
const utils_1 = require("../../utils");
/**
 * You can't use decorators in abstract classes or interfaces
 * so you can use this decorator to provide the class that provides the DataloaderHandler for a concrete class.
 */
function AliasFor(provider) {
    return (target) => {
        utils_1.LazyMetadataContainer.addAliasMetadata(provider, target);
    };
}
//# sourceMappingURL=alias-for.decorator.js.map