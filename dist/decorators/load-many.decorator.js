"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadMany = LoadMany;
const constants_1 = require("../constants");
const dataloader_types_1 = require("../types/dataloader.types");
function LoadMany(child, options) {
    const { by, where, on } = options;
    return (target, propertyKey) => {
        const parent = target.constructor;
        constants_1.dataloaderMetadata.AddRelationMetadata(() => parent, child, propertyKey, new dataloader_types_1.RelationMetadata({
            by: by,
            where: where,
            type: dataloader_types_1.RelationType.OneToMany,
            on: on,
            field: propertyKey,
        }));
    };
}
//# sourceMappingURL=load-many.decorator.js.map