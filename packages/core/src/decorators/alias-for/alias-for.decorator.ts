import type { Constructor } from "../../types/constructor.type";
import { AliasForReturnFn } from "../../types/dataloader.types";
import { LazyMetadataContainer } from "../../utils";

/**
 * You can't use decorators in abstract classes or interfaces,
 * so you can use this decorator to provide the class that provides the DataloaderHandler for a concrete class.
 */
export function AliasFor(provider: AliasForReturnFn) {
	return (target: NonNullable<unknown>) => {
		LazyMetadataContainer.addAliasMetadata(provider, target as Constructor);
	};
}
