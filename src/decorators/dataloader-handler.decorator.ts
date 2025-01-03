import { dataloaderMetadata } from "../constants";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";

/**
 * Decorator used to define a DataloaderHandler method in a class.
 * used to load data from some datasource.
 */
export function DataloaderHandler(key?: string) {
	return (target: any, propertyKey: string) => {
		dataloaderMetadata.setDataloaderHandler(
			key || propertyKey,
			new DataloaderHandlerMetadata(target.constructor, propertyKey),
		);
	};
}
