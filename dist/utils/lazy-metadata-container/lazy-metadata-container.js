"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyMetadataContainer = void 0;
const dataloader_types_1 = require("../../types/dataloader.types");
class LazyMetadataContainer {
    static addRelationshipMetadata(params) {
        LazyMetadataContainer.unloadedRelationships.push(params);
    }
    static addAliasMetadata(alias, type) {
        LazyMetadataContainer.unloadedAliases.set(alias, type);
    }
    static addDataloaderHandlerMetadata(key, metadata) {
        const exists = LazyMetadataContainer.dataloaderHandlers.has(key);
        if (exists) {
            throw new Error(`Dataloader handler with key ${key} already exists`);
        }
        LazyMetadataContainer.dataloaderHandlers.set(key, metadata);
    }
    static loadRelationshipMetadata() {
        var _a;
        for (const unloadedRelationship of LazyMetadataContainer.unloadedRelationships) {
            const parent = unloadedRelationship.parentFN();
            const child = unloadedRelationship.explicitChildFN();
            const isArray = Array.isArray(child);
            const metadata = {
                parent,
                child: isArray ? child[0] : child,
                isArray,
                key: unloadedRelationship.key,
                parentKey: unloadedRelationship.parentKey,
                handler: unloadedRelationship.handler,
                type: isArray ? dataloader_types_1.RelationType.OneToMany : dataloader_types_1.RelationType.OneToOne,
            };
            const isRelationAdded = LazyMetadataContainer.loadedRelationships.has(parent);
            if (!isRelationAdded) {
                LazyMetadataContainer.loadedRelationships.set(parent, new Map());
            }
            (_a = LazyMetadataContainer.loadedRelationships.get(parent)) === null || _a === void 0 ? void 0 : _a.set(unloadedRelationship.originalFieldName, metadata);
        }
    }
    static loadAliasMetadata() {
        for (const [alias, type] of LazyMetadataContainer.unloadedAliases) {
            LazyMetadataContainer.loadedAliases.set(type, alias());
        }
    }
    /**
     * Removes all items or resets the current state to its initial state.
     * Used in tests scenarios
     */
    static clear() {
        LazyMetadataContainer.unloadedRelationships = [];
        LazyMetadataContainer.unloadedAliases.clear();
        LazyMetadataContainer.loadedRelationships.clear();
        LazyMetadataContainer.loadedAliases.clear();
        LazyMetadataContainer.dataloaderHandlers.clear();
    }
}
exports.LazyMetadataContainer = LazyMetadataContainer;
LazyMetadataContainer.unloadedRelationships = [];
LazyMetadataContainer.unloadedAliases = new Map();
LazyMetadataContainer.loadedRelationships = new Map();
LazyMetadataContainer.loadedAliases = new Map();
LazyMetadataContainer.dataloaderHandlers = new Map();
//# sourceMappingURL=lazy-metadata-container.js.map