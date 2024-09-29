import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { DataloaderMetadataContainer } from "../utils/dataloader-metadata-container";

/**
 * Decorator do define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
export function DataloaderHandler(key?: string) {
	return (target: any, propertyKey: string) => {
		DataloaderMetadataContainer.setDataloaderHandler(
			key || propertyKey,
			new DataloaderHandlerMetadata(target.constructor, propertyKey),
		);
	};
}
