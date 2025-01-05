"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderMetadataContainer = void 0;
const adjacency_graph_1 = require("../types/adjacency-graph");
class DataloaderMetadataContainer {
    constructor(args) {
        this.start(args);
    }
    start(args) {
        const { relations, aliases, dataloaderHandlersMappedByKey } = args || {};
        this.relations = relations !== null && relations !== void 0 ? relations : new adjacency_graph_1.AdjacencyGraph();
        this.aliases = aliases !== null && aliases !== void 0 ? aliases : new Map();
        this.dataloaderHandlersMappedByKey =
            dataloaderHandlersMappedByKey !== null && dataloaderHandlersMappedByKey !== void 0 ? dataloaderHandlersMappedByKey : new Map();
    }
    AddRelationMetadata(parent, child, field, metadata) {
        var _a, _b;
        const parentClass = parent;
        const childClass = child;
        const relationMetadata = (_b = (_a = this.relations.getEdges(parentClass)) === null || _a === void 0 ? void 0 : _a.get(childClass)) !== null && _b !== void 0 ? _b : new Map();
        relationMetadata.set(field, metadata);
        this.relations.addEdge(parentClass, childClass, relationMetadata);
    }
    resolveRelations() {
        return this.relations.transform((vertex) => vertex(), (edge) => edge);
    }
    setDataloaderHandler(key, provider) {
        if (this.dataloaderHandlersMappedByKey.has(key)) {
            throw new Error(`Dataloader provider with key ${key} already exists`);
        }
        this.dataloaderHandlersMappedByKey.set(key, provider);
    }
    getDataloaderHandlers() {
        return this.dataloaderHandlersMappedByKey;
    }
    hasAlias(alias) {
        return this.aliases.has(alias);
    }
    setAlias(target, alias) {
        if (this.hasAlias(target)) {
            throw new Error(`Alias for ${target} already exists`);
        }
        this.aliases.set(target, alias);
    }
    resolveAliases() {
        const aliases = new Map();
        for (const [key, aliasReturnFn] of this.aliases.entries()) {
            aliases.set(key, aliasReturnFn());
        }
        return aliases;
    }
}
exports.DataloaderMetadataContainer = DataloaderMetadataContainer;
//# sourceMappingURL=dataloader-metadata-container.js.map