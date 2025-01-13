"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Load = Load;
const utils_1 = require("../../utils");
function Load(child, options) {
    const { key, parentKey, handler } = options;
    return (target, propertyKey) => {
        const parent = () => target.constructor;
        utils_1.LazyMetadataContainer.addRelationshipMetadata({
            key: key,
            parentKey: parentKey,
            handler: handler,
            parentFN: parent,
            explicitChildFN: child,
            originalFieldName: propertyKey,
        });
    };
}
//# sourceMappingURL=load.decorator.js.map