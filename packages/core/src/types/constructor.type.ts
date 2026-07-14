/**
 * Framework-agnostic replacement for Nest's `Type<T>`:
 * any class reference (constructable function).
 */
export interface Constructor<T = any> extends Function {
	new (...args: any[]): T;
}
