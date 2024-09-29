"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadOne = LoadOne;
const dataloader_types_1 = require("../types/dataloader.types");
const dataloader_metadata_container_1 = require("../utils/dataloader-metadata-container");
function LoadOne(child, options) {
    const { by, where, on } = options;
    return (target, propertyKey) => {
        const parent = target.constructor;
        dataloader_metadata_container_1.DataloaderMetadataContainer.AddRelationMetadata(() => parent, child, propertyKey, new dataloader_types_1.RelationMetadata({
            by: by,
            where: where,
            type: dataloader_types_1.RelationType.OneToOne,
            on: on,
            field: propertyKey,
        }));
    };
}
//# sourceMappingURL=load-one.decorator.js.map