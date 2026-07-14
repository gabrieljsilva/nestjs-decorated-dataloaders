import { DecoratedDataloadersError } from "./decorated-dataloaders.error";

export class ParentMetadataNotFoundError extends DecoratedDataloadersError {
	static readonly code = "PARENT_METADATA_NOT_FOUND";
	readonly code = ParentMetadataNotFoundError.code;

	constructor(payload: { parent: string }) {
		super(`Cannot find metadata for ${payload.parent}`, payload);
	}
}

export class FieldMetadataNotFoundError extends DecoratedDataloadersError {
	static readonly code = "FIELD_METADATA_NOT_FOUND";
	readonly code = FieldMetadataNotFoundError.code;

	constructor(payload: { parent: string; field: string }) {
		super(`Cannot find metadata for field: ${payload.field} in ${payload.parent}`, payload);
	}
}

export class HandlerNotFoundError extends DecoratedDataloadersError {
	static readonly code = "HANDLER_NOT_FOUND";
	readonly code = HandlerNotFoundError.code;

	constructor(payload: { handler: string }) {
		super(`Cannot find handler: ${payload.handler}`, payload);
	}
}

export class HandlerProviderNotFoundError extends DecoratedDataloadersError {
	static readonly code = "HANDLER_PROVIDER_NOT_FOUND";
	readonly code = HandlerProviderNotFoundError.code;

	constructor(payload: { provider: string; hint?: string }) {
		super(`cannot find provider: ${payload.provider}${payload.hint ? `. ${payload.hint}` : ""}`, payload);
	}
}

export class DataloaderNotFoundError extends DecoratedDataloadersError {
	static readonly code = "DATALOADER_NOT_FOUND";
	readonly code = DataloaderNotFoundError.code;

	constructor(payload: { parent: string }) {
		super(`Cannot find dataloader for ${payload.parent}`, payload);
	}
}

export class DuplicatedDataloaderHandlerError extends DecoratedDataloadersError {
	static readonly code = "DUPLICATED_DATALOADER_HANDLER";
	readonly code = DuplicatedDataloaderHandlerError.code;

	constructor(payload: { key: string }) {
		super(`Dataloader handler with key ${payload.key} already exists`, payload);
	}
}

export class InvalidBatchResultError extends DecoratedDataloadersError {
	static readonly code = "INVALID_BATCH_RESULT";
	readonly code = InvalidBatchResultError.code;

	constructor(payload: { received: string }) {
		super(`DataloaderMapper: 'entities' parameter must be an array but received ${payload.received}`, payload);
	}
}
