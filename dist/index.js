"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderService = exports.DataloaderModule = exports.LoadOne = exports.LoadMany = exports.DataloaderHandler = exports.AliasFor = void 0;
var alias_for_decorator_1 = require("./decorators/alias-for.decorator");
Object.defineProperty(exports, "AliasFor", { enumerable: true, get: function () { return alias_for_decorator_1.AliasFor; } });
var dataloader_handler_decorator_1 = require("./decorators/dataloader-handler.decorator");
Object.defineProperty(exports, "DataloaderHandler", { enumerable: true, get: function () { return dataloader_handler_decorator_1.DataloaderHandler; } });
var load_many_decorator_1 = require("./decorators/load-many.decorator");
Object.defineProperty(exports, "LoadMany", { enumerable: true, get: function () { return load_many_decorator_1.LoadMany; } });
var load_one_decorator_1 = require("./decorators/load-one.decorator");
Object.defineProperty(exports, "LoadOne", { enumerable: true, get: function () { return load_one_decorator_1.LoadOne; } });
var dataloader_module_1 = require("./module/dataloader.module");
Object.defineProperty(exports, "DataloaderModule", { enumerable: true, get: function () { return dataloader_module_1.DataloaderModule; } });
var dataloader_service_1 = require("./module/dataloader.service");
Object.defineProperty(exports, "DataloaderService", { enumerable: true, get: function () { return dataloader_service_1.DataloaderService; } });
//# sourceMappingURL=index.js.map