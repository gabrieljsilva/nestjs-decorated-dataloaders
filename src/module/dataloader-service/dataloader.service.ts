import { Inject, Injectable, Scope, Type } from "@nestjs/common";
import IDataloader from "dataloader";
import { JoinProperty, LoadedRelationship } from "../../types/dataloader.types";
import { DataloaderMapper, LazyMetadataContainer, resolvePath } from "../../utils";
import { CacheMapService } from "../cache-map";
import { ExplorerService } from "../explorer-service";

// Since Vitest runs tests in a different environment, it's necessary to use require() instead import statement
const Dataloader = require("dataloader");

// Type helper to get the type of class property
type PropertyType<T, K extends keyof T> = T[K];

interface CommonLoadParams<Parent> {
	from: Type<Parent>;
	args?: any[];
}

interface LoadParams<Parent, Field extends keyof Parent> extends CommonLoadParams<Parent> {
	field: Field;
	data: Parent;
}

interface LoadManyParams<Parent, Field extends keyof Parent> extends CommonLoadParams<Parent> {
	field: Field;
	data: Parent[];
}

/**
 * This service allows you to load data from a provider using a dataloader.
 * A Dataloader instance is created for each relation and for each request.
 */
@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
	private readonly dataloadersMappedByParentField: WeakMap<Type, Map<string, IDataloader<JoinProperty, any>>>;

	constructor(
		@Inject(ExplorerService)
		private readonly explorerService: ExplorerService,
		@Inject(CacheMapService)
		private readonly cacheMapService: CacheMapService,
	) {
		this.dataloadersMappedByParentField = new WeakMap();
	}

	async load<Parent, Field extends keyof Parent>(
		params: LoadParams<Parent, Field>,
	): Promise<PropertyType<Parent, Field>> {
		const { from, args } = params;
		const { resolvedKey, fieldName, metadata } = this.extractMetadata(params);
		const dataloader = this.getOrCreateDataloader(from, fieldName as string, metadata, args);
		return dataloader.load(resolvedKey);
	}

	async loadMany<Parent, Field extends keyof Parent>(
		params: Omit<LoadParams<Parent, Field>, "data"> & { data: Parent[] },
	): Promise<Array<PropertyType<Parent, Field>>> {
		const { from, field, data: parents, args } = params;

		if (!parents.length) {
			return [];
		}

		const { metadata, fieldName } = this.extractMetadata({
			from,
			field,
			data: parents[0],
			args,
		});

		const dataloader = this.getOrCreateDataloader(from, fieldName as string, metadata, args);
		const keys = parents.map((parent) => resolvePath(parent, metadata.key));
		return dataloader.loadMany(keys);
	}

	prime<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>, value: PropertyType<Parent, Field>) {
		const { from } = params;
		const { resolvedKey, fieldName, metadata } = this.extractMetadata(params);
		const dataloader = this.getOrCreateDataloader(from, fieldName as string, metadata);
		dataloader.prime(resolvedKey, value);
	}

	clear<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>) {
		const { from } = params;
		const { resolvedKey, fieldName } = this.extractMetadata(params);
		const dataloader = this.getDataloaderOrThrowError(from, fieldName as string);
		dataloader.clear(resolvedKey);
	}

	clearAll<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>) {
		const { from } = params;
		const dataloader = this.getDataloaderOrThrowError(from, params.field as string);
		dataloader.clearAll();
	}

	private extractMetadata<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>) {
		const relationships = LazyMetadataContainer.loadedRelationships;
		const parentMetadataMap = relationships.get(params.from);

		if (!parentMetadataMap) {
			throw new Error(`Cannot find metadata for ${params.from.name}`);
		}

		const fieldMetadata = parentMetadataMap.get(params.field as string);

		if (!fieldMetadata) {
			throw new Error(`Cannot find metadata for field: ${String(params.field)} in ${params.from.name}`);
		}

		const resolvedKey = resolvePath(params.data, fieldMetadata.key);

		return {
			resolvedKey,
			metadata: fieldMetadata,
			fieldName: params.field,
		};
	}

	private getDataloaderOrThrowError<Parent>(parent: Type<Parent>, fieldName: string) {
		const parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);

		if (!parentDataloaderMap) {
			throw new Error(`Cannot find dataloader for ${parent.name}`);
		}

		return parentDataloaderMap.get(fieldName);
	}

	private getOrCreateDataloader<Parent>(
		parent: Type<Parent>,
		fieldName: string,
		metadata: LoadedRelationship,
		args?: any[],
	) {
		let parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);

		if (!parentDataloaderMap) {
			parentDataloaderMap = new Map();
			this.dataloadersMappedByParentField.set(parent, parentDataloaderMap);
		}

		let foundDataloader = parentDataloaderMap.get(fieldName);

		if (!foundDataloader) {
			foundDataloader = this.createDataloader(metadata, args);
			parentDataloaderMap.set(fieldName, foundDataloader);
		}

		return foundDataloader;
	}

	private createDataloader(metadata: LoadedRelationship, args = []) {
		const { repository, provider } = this.explorerService.findMetadataHandlerByName(metadata.handler);

		const fetchRecords = async (keys: Array<JoinProperty>) => {
			return repository[provider.field](keys, ...args) as unknown[];
		};

		const batchFunction = async (keys: Array<JoinProperty>) => {
			const entities = await fetchRecords(keys);
			return DataloaderMapper.map(metadata, keys, entities);
		};

		// @ts-expect-error untyped function by require('dataloader')
		return new Dataloader<number | string, any>(batchFunction, {
			cache: this.cacheMapService.cache,
			name: this.cacheMapService.name,
			maxBatchSize: this.cacheMapService.maxBatchSize,
			cacheMap: this.cacheMapService.getCacheMap?.(),
		});
	}
}
