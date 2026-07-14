import { HandlerProviderNotFoundError } from "../errors";
import { Constructor } from "../types/constructor.type";
import { HandlerResolver } from "./handler-resolver";

/**
 * HandlerResolver for usage without a DI container:
 * instances holding @DataloaderHandler methods are registered manually.
 */
export class SimpleHandlerResolver implements HandlerResolver {
	private readonly instances = new Map<Constructor | Function, any>();

	register(instance: NonNullable<object>, as?: Constructor | Function) {
		this.instances.set(as || instance.constructor, instance);
		return this;
	}

	resolveInstance(provide: Constructor | Function) {
		const instance = this.instances.get(provide);

		if (!instance) {
			throw new HandlerProviderNotFoundError({ provider: provide.name, hint: "Did you forget to register it?" });
		}

		return instance;
	}
}
