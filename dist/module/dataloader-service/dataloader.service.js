"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderService = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../utils");
const cache_map_1 = require("../cache-map");
const explorer_service_1 = require("../explorer-service");
// Since Vitest runs tests in a different environment, it's necessary to use require() instead import statement
const Dataloader = require("dataloader");
/**
 * This service allows you to load data from a provider using a dataloader.
 * A Dataloader instance is created for each relation and for each request.
 */
let DataloaderService = class DataloaderService {
    constructor(explorerService, cacheMapService) {
        this.explorerService = explorerService;
        this.cacheMapService = cacheMapService;
        this.dataloadersMappedByParentField = new WeakMap();
    }
    async load(params) {
        const { from, args } = params;
        const { resolvedKey, fieldName, metadata } = this.extractMetadata(params);
        const dataloader = this.getOrCreateDataloader(from, fieldName, metadata, args);
        return dataloader.load(resolvedKey);
    }
    async loadMany(params) {
        const { from, field, data: parents, args } = params;
        if (!parents.length) {
            return [];
        }
        const { metadata, fieldName } = this.extractMetadata({
            from,
            field,
            data: parents[0],
            args,
        });
        const dataloader = this.getOrCreateDataloader(from, fieldName, metadata, args);
        const keys = parents.map((parent) => (0, utils_1.resolvePath)(parent, metadata.key));
        return dataloader.loadMany(keys);
    }
    prime(params, value) {
        const { from } = params;
        const { resolvedKey, fieldName, metadata } = this.extractMetadata(params);
        const dataloader = this.getOrCreateDataloader(from, fieldName, metadata);
        dataloader.prime(resolvedKey, value);
    }
    clear(params) {
        const { from } = params;
        const { resolvedKey, fieldName } = this.extractMetadata(params);
        const dataloader = this.getDataloaderOrThrowError(from, fieldName);
        dataloader.clear(resolvedKey);
    }
    clearAll(params) {
        const { from } = params;
        const dataloader = this.getDataloaderOrThrowError(from, params.field);
        dataloader.clearAll();
    }
    extractMetadata(params) {
        const relationships = utils_1.LazyMetadataContainer.loadedRelationships;
        const parentMetadataMap = relationships.get(params.from);
        if (!parentMetadataMap) {
            throw new Error(`Cannot find metadata for ${params.from.name}`);
        }
        const fieldMetadata = parentMetadataMap.get(params.field);
        if (!fieldMetadata) {
            throw new Error(`Cannot find metadata for field: ${String(params.field)} in ${params.from.name}`);
        }
        const resolvedKey = (0, utils_1.resolvePath)(params.data, fieldMetadata.key);
        return {
            resolvedKey,
            metadata: fieldMetadata,
            fieldName: params.field,
        };
    }
    getDataloaderOrThrowError(parent, fieldName) {
        const parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);
        if (!parentDataloaderMap) {
            throw new Error(`Cannot find dataloader for ${parent.name}`);
        }
        return parentDataloaderMap.get(fieldName);
    }
    getOrCreateDataloader(parent, fieldName, metadata, args) {
        let parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);
        if (!parentDataloaderMap) {
            parentDataloaderMap = new Map();
            this.dataloadersMappedByParentField.set(parent, parentDataloaderMap);
        }
        let foundDataloader = parentDataloaderMap.get(fieldName);
        if (!foundDataloader) {
            foundDataloader = this.createDataloader(metadata, args);
            parentDataloaderMap.set(fieldName, foundDataloader);
        }
        return foundDataloader;
    }
    createDataloader(metadata, args = []) {
        var _a, _b;
        const { repository, provider } = this.explorerService.findMetadataHandlerByName(metadata.handler);
        const fetchRecords = async (keys) => {
            return repository[provider.field](keys, ...args);
        };
        const batchFunction = async (keys) => {
            const entities = await fetchRecords(keys);
            return utils_1.DataloaderMapper.map(metadata, keys, entities);
        };
        // @ts-expect-error untyped function by require('dataloader')
        return new Dataloader(batchFunction, {
            cache: this.cacheMapService.cache,
            name: this.cacheMapService.name,
            maxBatchSize: this.cacheMapService.maxBatchSize,
            cacheMap: (_b = (_a = this.cacheMapService).getCacheMap) === null || _b === void 0 ? void 0 : _b.call(_a),
        });
    }
};
exports.DataloaderService = DataloaderService;
exports.DataloaderService = DataloaderService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(explorer_service_1.ExplorerService)),
    __param(1, (0, common_1.Inject)(cache_map_1.CacheMapService)),
    __metadata("design:paramtypes", [explorer_service_1.ExplorerService,
        cache_map_1.CacheMapService])
], DataloaderService);
//# sourceMappingURL=dataloader.service.js.map