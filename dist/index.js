"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderService = exports.DataloaderModule = exports.Load = exports.DataloaderHandler = exports.AliasFor = void 0;
var alias_for_decorator_1 = require("./decorators/alias-for/alias-for.decorator");
Object.defineProperty(exports, "AliasFor", { enumerable: true, get: function () { return alias_for_decorator_1.AliasFor; } });
var dataloader_handler_decorator_1 = require("./decorators/dataloader-handler/dataloader-handler.decorator");
Object.defineProperty(exports, "DataloaderHandler", { enumerable: true, get: function () { return dataloader_handler_decorator_1.DataloaderHandler; } });
var load_decorator_1 = require("./decorators/load/load.decorator");
Object.defineProperty(exports, "Load", { enumerable: true, get: function () { return load_decorator_1.Load; } });
var dataloader_module_1 = require("./module/dataloader-module/dataloader.module");
Object.defineProperty(exports, "DataloaderModule", { enumerable: true, get: function () { return dataloader_module_1.DataloaderModule; } });
var dataloader_service_1 = require("./module/dataloader-service/dataloader.service");
Object.defineProperty(exports, "DataloaderService", { enumerable: true, get: function () { return dataloader_service_1.DataloaderService; } });
//# sourceMappingURL=index.js.map