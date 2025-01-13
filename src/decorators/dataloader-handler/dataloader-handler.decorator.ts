import { DataloaderHandlerMetadata } from "../../types/dataloader.types";
import { LazyMetadataContainer } from "../../utils";

/**
 * Decorator used to define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
export function DataloaderHandler(key?: string) {
	return (target: any, propertyKey: string) => {
		const metadata: DataloaderHandlerMetadata = {
			provide: target.constructor,
			field: propertyKey,
		};

		LazyMetadataContainer.addDataloaderHandlerMetadata(key || propertyKey, metadata);
	};
}
