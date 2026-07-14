import { DecoratedDataloadersError, isDecoratedDataloadersError } from "./decorated-dataloaders.error";
import {
	DataloaderNotFoundError,
	DuplicatedDataloaderHandlerError,
	FieldMetadataNotFoundError,
	HandlerNotFoundError,
	HandlerProviderNotFoundError,
	InvalidBatchResultError,
	ParentMetadataNotFoundError,
} from "./errors";

describe("DecoratedDataloadersError", () => {
	const instances: [DecoratedDataloadersError, string, string][] = [
		[new ParentMetadataNotFoundError({ parent: "User" }), "PARENT_METADATA_NOT_FOUND", "Cannot find metadata for User"],
		[
			new FieldMetadataNotFoundError({ parent: "User", field: "photos" }),
			"FIELD_METADATA_NOT_FOUND",
			"Cannot find metadata for field: photos in User",
		],
		[new HandlerNotFoundError({ handler: "LOAD_PHOTOS" }), "HANDLER_NOT_FOUND", "Cannot find handler: LOAD_PHOTOS"],
		[
			new HandlerProviderNotFoundError({ provider: "PhotoRepository" }),
			"HANDLER_PROVIDER_NOT_FOUND",
			"cannot find provider: PhotoRepository",
		],
		[
			new HandlerProviderNotFoundError({ provider: "PhotoRepository", hint: "Did you forget to register it?" }),
			"HANDLER_PROVIDER_NOT_FOUND",
			"cannot find provider: PhotoRepository. Did you forget to register it?",
		],
		[new DataloaderNotFoundError({ parent: "User" }), "DATALOADER_NOT_FOUND", "Cannot find dataloader for User"],
		[
			new DuplicatedDataloaderHandlerError({ key: "LOAD_PHOTOS" }),
			"DUPLICATED_DATALOADER_HANDLER",
			"Dataloader handler with key LOAD_PHOTOS already exists",
		],
		[
			new InvalidBatchResultError({ received: "null" }),
			"INVALID_BATCH_RESULT",
			"DataloaderMapper: 'entities' parameter must be an array but received null",
		],
	];

	it.each(instances)("%s has stable code and message", (error, code, message) => {
		expect(error.code).toBe(code);
		expect(error.message).toBe(message);
		expect(error.name).toBe(error.constructor.name);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DecoratedDataloadersError);
		expect(error.payload).toBeDefined();
	});

	describe("isDecoratedDataloadersError", () => {
		it("should return true for any error of the lib", () => {
			for (const [error] of instances) {
				expect(isDecoratedDataloadersError(error)).toBe(true);
			}
		});

		it("should return false for plain errors and non-errors", () => {
			expect(isDecoratedDataloadersError(new Error("boom"))).toBe(false);
			expect(isDecoratedDataloadersError("boom")).toBe(false);
			expect(isDecoratedDataloadersError(null)).toBe(false);
			expect(isDecoratedDataloadersError(undefined)).toBe(false);
			expect(isDecoratedDataloadersError({})).toBe(false);
		});

		it("should recognize errors from a duplicated copy of the package via the shared marker", () => {
			// simulates an error constructed by another copy of the lib (broken instanceof)
			const foreignError = Object.assign(new Error("Cannot find metadata for User"), {
				code: "PARENT_METADATA_NOT_FOUND",
				[Symbol.for("decorated-dataloaders.error")]: true,
			});

			expect(foreignError).not.toBeInstanceOf(DecoratedDataloadersError);
			expect(isDecoratedDataloadersError(foreignError)).toBe(true);
		});
	});
});
