"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationMetadata = exports.RelationType = void 0;
var RelationType;
(function (RelationType) {
    RelationType["OneToOne"] = "OneToOne";
    RelationType["OneToMany"] = "OneToMany";
})(RelationType || (exports.RelationType = RelationType = {}));
class RelationMetadata {
    constructor(metadata) {
        this.type = metadata.type;
        this.by = metadata.by;
        this.where = metadata.where;
        this.field = metadata.field;
        this.on = metadata.on;
    }
}
exports.RelationMetadata = RelationMetadata;
//# sourceMappingURL=dataloader.types.js.map