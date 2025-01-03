import type { Type } from "@nestjs/common";
import { dataloaderMetadata } from "../constants";
import { AliasForReturnFn } from "../types/dataloader.types";

/**
 * You can't use decorators in abstract classes or interfaces
 * so you can use this decorator to provide the class that provides the DataloaderHandler for a concrete class.
 */
export function AliasFor(provider: AliasForReturnFn) {
	return (target: NonNullable<unknown>) => {
		dataloaderMetadata.setAlias(target as Type, provider);
	};
}
