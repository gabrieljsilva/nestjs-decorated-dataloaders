import { DataloaderHandlerMetadata } from "../../types/dataloader.types";
import { LazyMetadataContainer } from "../../utils";

/**
 * Decorator used to define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
export function DataloaderHandler(key?: string) {
	return (target: any, propertyKey: string) => {
		const metadata: DataloaderHandlerMetadata = {
			// on static methods the decorator target is the class itself, not the prototype
			provide: typeof target === "function" ? target : target.constructor,
			field: propertyKey,
		};

		LazyMetadataContainer.addDataloaderHandlerMetadata(key || propertyKey, metadata);
	};
}
