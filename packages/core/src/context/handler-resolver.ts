import { Constructor } from "../types/constructor.type";

/**
 * Abstraction over "how to get the instance that holds a @DataloaderHandler method".
 * Each integration (NestJS DI, manual registration, etc.) provides its own implementation.
 */
export interface HandlerResolver {
	resolveInstance(provide: Constructor | Function): any;
}
