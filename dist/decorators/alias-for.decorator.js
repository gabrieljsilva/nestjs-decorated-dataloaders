"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasFor = AliasFor;
const dataloader_metadata_container_1 = require("../utils/dataloader-metadata-container");
function AliasFor(provider) {
    return (target) => {
        dataloader_metadata_container_1.DataloaderMetadataContainer.setAlias(target, provider);
    };
}
//# sourceMappingURL=alias-for.decorator.js.map