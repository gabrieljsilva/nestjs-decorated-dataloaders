"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Load = Load;
const constants_1 = require("../constants");
const dataloader_types_1 = require("../types/dataloader.types");
function Load(child, options) {
    const { key, parentKey, handler } = options;
    return (target, propertyKey) => {
        const parent = target.constructor;
        const isArray = Array.isArray(child());
        const childFn = isArray ? () => child()[0] : () => child();
        constants_1.dataloaderMetadata.AddRelationMetadata(() => parent, childFn, propertyKey, new dataloader_types_1.RelationMetadata({
            by: key,
            where: parentKey,
            type: isArray ? dataloader_types_1.RelationType.OneToMany : dataloader_types_1.RelationType.OneToOne,
            on: handler,
            field: propertyKey,
        }));
    };
}
//# sourceMappingURL=load.decorator.js.map