"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderMapper = void 0;
const dataloader_types_1 = require("../types/dataloader.types");
class DataloaderMapper {
    static map(metadata, keys, entities) {
        if (metadata.type === dataloader_types_1.RelationType.OneToOne) {
            return DataloaderMapper.oneToOne(metadata, keys, entities);
        }
        return DataloaderMapper.oneToMany(metadata, keys, entities);
    }
    static oneToMany(metadata, keys, entities) {
        const entitiesMappedByKey = new Map();
        const path = metadata.where;
        for (const entity of entities) {
            const joinKeyOrKeys = DataloaderMapper.resolvePath(entity, path);
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
            const key = DataloaderMapper.resolvePath(entity, metadata.where);
            if (key) {
                entitiesMappedByKey.set(key, entity);
            }
        }
        return keys.map((key) => entitiesMappedByKey.get(key) || null);
    }
    static resolvePath(entity, path) {
        let current = entity;
        let part = "";
        for (let i = 0; i <= path.length; i++) {
            const char = path[i];
            if (char === "." || i === path.length) {
                if (Array.isArray(current)) {
                    const results = [];
                    for (const item of current) {
                        if (item && item[part] !== undefined) {
                            results.push(item[part]);
                        }
                    }
                    current = results.length ? results : undefined;
                }
                else {
                    current = current[part];
                }
                part = "";
            }
            else {
                part += char;
            }
        }
        return current;
    }
}
exports.DataloaderMapper = DataloaderMapper;
//# sourceMappingURL=dataloader-mapper.js.map