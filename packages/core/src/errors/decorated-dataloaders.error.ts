// Symbol.for so the check works across duplicated copies of the package (e.g. two node_modules)
export const DECORATED_DATALOADERS_ERROR_MARKER = Symbol.for("decorated-dataloaders.error");

export abstract class DecoratedDataloadersError extends Error {
	abstract readonly code: string;
	readonly payload?: Record<string, unknown>;
	readonly [DECORATED_DATALOADERS_ERROR_MARKER] = true;

	constructor(message: string, payload?: Record<string, unknown>) {
		super(message);
		this.name = this.constructor.name;
		this.payload = payload;
	}
}

export function isDecoratedDataloadersError(error: unknown): error is DecoratedDataloadersError {
	return (
		error instanceof DecoratedDataloadersError ||
		(typeof error === "object" && error !== null && (error as any)[DECORATED_DATALOADERS_ERROR_MARKER] === true)
	);
}
