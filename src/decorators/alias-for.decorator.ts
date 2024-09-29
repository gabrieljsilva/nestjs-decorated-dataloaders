import type { Type } from "@nestjs/common";
import { AliasForReturnFn } from "../types/dataloader.types";
import { DataloaderMetadataContainer } from "../utils/dataloader-metadata-container";

/**
 * You can't use decorators in abstract classes or interfaces
 * so you can use this decorator to provide the class that provides the DataloaderHandler for a concrete class.
 */
export function AliasFor(provider: AliasForReturnFn) {
	return (target: NonNullable<unknown>) => {
		DataloaderMetadataContainer.setAlias(target as Type, provider);
	};
}
