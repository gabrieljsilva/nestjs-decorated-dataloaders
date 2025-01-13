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
exports.ExplorerService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const utils_1 = require("../../utils");
let ExplorerService = class ExplorerService {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    findMetadataHandlerByName(handlerName) {
        const provider = utils_1.LazyMetadataContainer.dataloaderHandlers.get(handlerName);
        if (!provider) {
            throw new Error(`cannot find provider: ${handlerName}`);
        }
        const resolvedProvider = utils_1.LazyMetadataContainer.loadedAliases.get(provider.provide);
        const repository = this.moduleRef.get(resolvedProvider || provider.provide, { strict: false });
        // /**
        //  * PS: using strict: false allows us to load all providers from the module globally or not
        //  * using strict: true will only load providers from the current module
        //  * however, it's not possible to use providers imported from other modules
        //  * using "import" statement, but it's possible to use providers using "providers"
        //  * option in the module registration;
        //  *
        //  * Is not recommended to use moduleRef in the constructor: https://github.com/nestjs/nest/issues/4368
        //  * The module should be used in onModuleInit lifecycle hook, this way dependencies are resolved correctly;
        //  *
        //  */
        if (!repository) {
            throw new Error(`cannot find provider: ${provider.provide.name}`);
        }
        return {
            repository: repository,
            provider: provider,
        };
    }
};
exports.ExplorerService = ExplorerService;
exports.ExplorerService = ExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(core_1.ModuleRef)),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], ExplorerService);
//# sourceMappingURL=explorer.service.js.map