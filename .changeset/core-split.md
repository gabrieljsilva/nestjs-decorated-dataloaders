---
"@decorated-dataloaders/core": major
"@decorated-dataloaders/nestjs": major
---

Initial release of the decorated-dataloaders monorepo.

- `@decorated-dataloaders/core`: framework-agnostic decorators, metadata container, `DataloaderContext` + `HandlerResolver` (with `SimpleHandlerResolver` for usage without DI).
- `@decorated-dataloaders/nestjs`: NestJS adapter (`DataloaderModule`, request-scoped `DataloaderService`, `ModuleRef`-based handler resolution).
- Typed errors with stable codes and the `isDecoratedDataloadersError` guard.
- Breaking vs `nestjs-decorated-dataloaders`: package rename and `data` → `parent` in load params (see README migration guide).
