"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasFor = AliasFor;
const constants_1 = require("../constants");
function AliasFor(provider) {
    return (target) => {
        constants_1.dataloaderMetadata.setAlias(target, provider);
    };
}
//# sourceMappingURL=alias-for.decorator.js.map