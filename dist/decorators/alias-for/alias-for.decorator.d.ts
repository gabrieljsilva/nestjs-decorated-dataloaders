import { AliasForReturnFn } from "../../types/dataloader.types";
/**
 * You can't use decorators in abstract classes or interfaces
 * so you can use this decorator to provide the class that provides the DataloaderHandler for a concrete class.
 */
export declare function AliasFor(provider: AliasForReturnFn): (target: NonNullable<unknown>) => void;
