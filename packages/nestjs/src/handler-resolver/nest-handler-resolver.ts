import { Constructor, HandlerResolver } from "@decorated-dataloaders/core";
import { Inject, Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

/**
 * HandlerResolver backed by the NestJS DI container.
 *
 * PS: using strict: false allows us to load providers from any module, global or not.
 * Providers must be registered in some Nest module; resolution happens lazily at load time,
 * after the application context is fully initialized.
 */
@Injectable()
export class NestHandlerResolver implements HandlerResolver {
	constructor(
		@Inject(ModuleRef)
		private readonly moduleRef: ModuleRef,
	) {}

	resolveInstance(provide: Constructor | Function) {
		try {
			return this.moduleRef.get(provide as Constructor, { strict: false });
		} catch {
			// ModuleRef#get throws UnknownElementException for missing providers;
			// returning undefined lets the core raise its own HandlerProviderNotFoundError
			return undefined;
		}
	}
}
