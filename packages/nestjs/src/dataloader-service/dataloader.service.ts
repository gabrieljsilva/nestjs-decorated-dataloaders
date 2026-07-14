import { DataloaderContext, LoadParams, PropertyType } from "@decorated-dataloaders/core";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { CacheMapService } from "../cache-map";
import { NestHandlerResolver } from "../handler-resolver";

/**
 * This service allows you to load data from a provider using a dataloader.
 * A Dataloader instance is created for each relation and for each request.
 */
@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
	private readonly context: DataloaderContext;

	constructor(
		@Inject(NestHandlerResolver)
		handlerResolver: NestHandlerResolver,
		@Inject(CacheMapService)
		cacheMapService: CacheMapService,
	) {
		this.context = new DataloaderContext({
			handlerResolver,
			cache: cacheMapService.cache,
			name: cacheMapService.name,
			maxBatchSize: cacheMapService.maxBatchSize,
			getCacheMap: cacheMapService.getCacheMap,
		});
	}

	async load<Parent, Field extends keyof Parent>(
		params: LoadParams<Parent, Field>,
	): Promise<PropertyType<Parent, Field>> {
		return this.context.load(params);
	}

	async loadMany<Parent, Field extends keyof Parent>(
		params: Omit<LoadParams<Parent, Field>, "parent"> & { parent: Parent[] },
	): Promise<Array<PropertyType<Parent, Field> | Error>> {
		return this.context.loadMany(params);
	}

	prime<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>, value: PropertyType<Parent, Field>) {
		return this.context.prime(params, value);
	}

	clear<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>) {
		return this.context.clear(params);
	}

	clearAll<Parent, Field extends keyof Parent>(params: Pick<LoadParams<Parent, Field>, "from" | "field">) {
		return this.context.clearAll(params);
	}
}
