import { Type } from "@nestjs/common";

/**
 * Stores metadata about a DataloaderHandler used to load data from some datasource.
 * provide: the class that provides the DataloaderHandler
 * field: the field name of the DataloaderHandler
 */
export class DataloaderHandlerMetadata {
	provide: Type;
	field: string;

	constructor(provider: Type, field: string) {
		this.provide = provider;
		this.field = field;
	}
}
