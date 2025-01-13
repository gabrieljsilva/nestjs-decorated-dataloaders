"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderMapper = void 0;
const dataloader_types_1 = require("../../types/dataloader.types");
const resolve_paths_1 = require("../resolve-paths");
/**
 * Class to map the entities to the keys used in the dataloader.
 * Uses the metadata to know how to map the entities, like paths and relation type.
 */
class DataloaderMapper {
    static map(metadata, keys, entities) {
        if (!Array.isArray(entities)) {
            throw new Error(`DataloaderMapper: 'entities' parameter must be an array but received ${entities === null ? "null" : typeof entities}`);
        }
        if (metadata.type === dataloader_types_1.RelationType.OneToOne) {
            return DataloaderMapper.oneToOne(metadata, keys, entities);
        }
        return DataloaderMapper.oneToMany(metadata, keys, entities);
    }
    static oneToMany(metadata, keys, entities) {
        const entitiesMappedByKey = new Map();
        const path = metadata.parentKey;
        for (const entity of entities) {
            const joinKeyOrKeys = (0, resolve_paths_1.resolvePath)(entity, path);
            const isArray = Array.isArray(joinKeyOrKeys);
            if (isArray) {
                for (const key of joinKeyOrKeys) {
                    if (!entitiesMappedByKey.has(key)) {
                        entitiesMappedByKey.set(key, []);
                    }
                    entitiesMappedByKey.get(key).push(entity);
                }
            }
            else if (joinKeyOrKeys) {
                if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
                    entitiesMappedByKey.set(joinKeyOrKeys, []);
                }
                entitiesMappedByKey.get(joinKeyOrKeys).push(entity);
            }
        }
        return keys.map((key) => entitiesMappedByKey.get(key) || []);
    }
    static oneToOne(metadata, keys, entities) {
        const entitiesMappedByKey = new Map();
        for (const entity of entities) {
            const joinKeyOrKeys = (0, resolve_paths_1.resolvePath)(entity, metadata.parentKey);
            const isArray = Array.isArray(joinKeyOrKeys);
            if (isArray) {
                for (const key of joinKeyOrKeys) {
                    if (!entitiesMappedByKey.has(key)) {
                        entitiesMappedByKey.set(key, entity);
                    }
                }
            }
            else if (joinKeyOrKeys) {
                if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
                    entitiesMappedByKey.set(joinKeyOrKeys, entity);
                }
            }
        }
        return keys.map((key) => entitiesMappedByKey.get(key) || null);
    }
}
exports.DataloaderMapper = DataloaderMapper;
//# sourceMappingURL=dataloader-mapper.js.map