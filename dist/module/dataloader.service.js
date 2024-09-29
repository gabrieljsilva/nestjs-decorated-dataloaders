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
const core_1 = require("@nestjs/core");
const dataloader_mapper_1 = require("../utils/dataloader-mapper");
const cache_map_service_1 = require("./cache-map.service");
const dataloader_metadata_service_1 = require("./dataloader-metadata.service");
const Dataloader = require("dataloader");
let DataloaderService = class DataloaderService {
    constructor(moduleRef, dataloaderMetadataService, cacheMapService) {
        this.moduleRef = moduleRef;
        this.dataloaderMetadataService = dataloaderMetadataService;
        this.cacheMapService = cacheMapService;
        this.dataloadersMappedByParentField = new WeakMap();
    }
    async load(child, params) {
        const { key, metadata, args } = this.extractMetadata(child, params);
        const dataloader = this.getOrCreateDataloader(params, metadata, ...args);
        return dataloader.load(key);
    }
    extractMetadata(child, params) {
        const isArray = Array.isArray(child);
        const actualChild = isArray ? child[0] : child;
        const { by, from, field } = params;
        const metadataMap = this.dataloaderMetadataService.getMetadata(from, actualChild);
        if (!metadataMap) {
            throw new Error(`cannot find metadata for ${from.name} -> ${actualChild.name}`);
        }
        if (!field && metadataMap.size > 1) {
            throw new Error(`multiple relations found between ${from.name} and ${actualChild.name}, please provide the 'field' option.`);
        }
        const metadata = metadataMap.get(field) || metadataMap.values().next().value;
        const [parent, args = []] = by;
        const key = dataloader_mapper_1.DataloaderMapper.resolvePath(parent, metadata.by);
        return {
            key,
            metadata,
            args,
        };
    }
    getOrCreateDataloader(params, metadata, ...args) {
        const field = params.field || metadata.field;
        let parentDataloaderMap = this.dataloadersMappedByParentField.get(params.from);
        if (!parentDataloaderMap) {
            parentDataloaderMap = new Map();
            this.dataloadersMappedByParentField.set(params.from, parentDataloaderMap);
        }
        let foundDataloader = parentDataloaderMap.get(field);
        if (!foundDataloader) {
            foundDataloader = this.createDataloader(metadata, ...args);
            parentDataloaderMap.set(field, foundDataloader);
        }
        return foundDataloader;
    }
    createDataloader(metadata, ...args) {
        var _a, _b;
        const provider = this.dataloaderMetadataService.getDataloaderHandler(metadata.on);
        if (!provider) {
            throw new Error(`cannot find provider: ${metadata.on}`);
        }
        const resolvedProvider = this.dataloaderMetadataService.getAlias(provider.provide);
        const repository = this.moduleRef.get(resolvedProvider || provider.provide, { strict: false });
        if (!repository) {
            throw new Error(`cannot find provider: ${provider.provide.name}`);
        }
        const fetchRecords = async (keys) => {
            return repository[provider.field](keys, ...args);
        };
        const batchFunction = async (keys) => {
            const entities = await fetchRecords(keys);
            return dataloader_mapper_1.DataloaderMapper.map(metadata, keys, entities);
        };
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
    __param(0, (0, common_1.Inject)(core_1.ModuleRef)),
    __param(1, (0, common_1.Inject)(dataloader_metadata_service_1.DataloaderMetadataService)),
    __param(2, (0, common_1.Inject)(cache_map_service_1.CacheMapService)),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        dataloader_metadata_service_1.DataloaderMetadataService,
        cache_map_service_1.CacheMapService])
], DataloaderService);
//# sourceMappingURL=dataloader.service.js.map