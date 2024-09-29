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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMapService = void 0;
const common_1 = require("@nestjs/common");
let CacheMapService = class CacheMapService {
    constructor(options) {
        this.name = options === null || options === void 0 ? void 0 : options.name;
        this.cache = options === null || options === void 0 ? void 0 : options.cache;
        this.maxBatchSize = options === null || options === void 0 ? void 0 : options.maxBatchSize;
        this.getCacheMap = options === null || options === void 0 ? void 0 : options.getCacheMap;
    }
};
exports.CacheMapService = CacheMapService;
exports.CacheMapService = CacheMapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], CacheMapService);
//# sourceMappingURL=cache-map.service.js.map