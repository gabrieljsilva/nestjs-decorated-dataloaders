"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderMetadataContainer = void 0;
const adjacency_graph_1 = require("../types/adjacency-graph");
class DataloaderMetadataContainer {
    static AddRelationMetadata(parent, child, field, metadata) {
        var _a;
        let relationMetadata = (_a = DataloaderMetadataContainer.relations.getEdges(parent)) === null || _a === void 0 ? void 0 : _a.get(child);
        relationMetadata || (relationMetadata = new Map([[field, metadata]]));
        DataloaderMetadataContainer.relations.addEdge(parent, child, relationMetadata);
    }
    static resolveRelations() {
        return DataloaderMetadataContainer.relations.transform((vertex) => vertex(), (edge) => edge);
    }
    static setDataloaderHandler(key, provider) {
        if (DataloaderMetadataContainer.dataloaderHandlersMappedByKey.has(key)) {
            throw new Error(`Dataloader provider with key ${key} already exists`);
        }
        DataloaderMetadataContainer.dataloaderHandlersMappedByKey.set(key, provider);
    }
    static getDataloaderHandlers() {
        return DataloaderMetadataContainer.dataloaderHandlersMappedByKey;
    }
    static hasAlias(alias) {
        return DataloaderMetadataContainer.aliases.has(alias);
    }
    static setAlias(target, alias) {
        if (DataloaderMetadataContainer.hasAlias(target)) {
            throw new Error(`Alias for ${target} already exists`);
        }
        DataloaderMetadataContainer.aliases.set(target, alias);
    }
    static resolveAliases() {
        const aliases = new Map();
        for (const [key, aliasReturnFn] of DataloaderMetadataContainer.aliases.entries()) {
            aliases.set(key, aliasReturnFn());
        }
        return aliases;
    }
}
exports.DataloaderMetadataContainer = DataloaderMetadataContainer;
DataloaderMetadataContainer.relations = new adjacency_graph_1.AdjacencyGraph();
DataloaderMetadataContainer.aliases = new Map();
DataloaderMetadataContainer.dataloaderHandlersMappedByKey = new Map();
//# sourceMappingURL=dataloader-metadata-container.js.map