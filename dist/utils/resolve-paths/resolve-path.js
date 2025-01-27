"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = resolvePath;
function resolvePath(entity, path) {
    if (!path || !entity)
        return undefined;
    let current = entity;
    const parts = path.split(".");
    for (const part of parts) {
        if (Array.isArray(current)) {
            const results = current.map((item) => item === null || item === void 0 ? void 0 : item[part]).filter((value) => value !== undefined);
            if (!results.length) {
                return undefined;
            }
            current = results;
        }
        else {
            if (current === undefined) {
                return undefined;
            }
            current = current[part];
        }
    }
    return current;
}
//# sourceMappingURL=resolve-path.js.map