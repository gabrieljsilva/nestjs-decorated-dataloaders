import { Inject, Injectable, Scope, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import IDataloader from "dataloader";
import { JoinProperty, RelationMetadata } from "../types/dataloader.types";
import { DataloaderMapper } from "../utils/dataloader-mapper";
import { CacheMapService } from "./cache-map.service";
import { DataloaderMetadataService } from "./dataloader-metadata.service";

// Since Vitest runs tests in a different environment, it's necessary to use require() instead import statement
const Dataloader = require("dataloader");

interface LoadParams<Parent> {
	from: Type;
	field?: string;
	by: [Parent, ...any];
}

/**
 * This service allows you to load data from a provider using a dataloader.
 * A Dataloader instance is created for each relation and for each request.
 */

@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
	private readonly dataloadersMappedByParentField: WeakMap<Type, Map<string, IDataloader<JoinProperty, any>>>;

	constructor(
		@Inject(ModuleRef)
		private readonly moduleRef: ModuleRef,

		@Inject(DataloaderMetadataService)
		private readonly dataloaderMetadataService: DataloaderMetadataService,

		@Inject(CacheMapService)
		private readonly cacheMapService: CacheMapService,
	) {
		this.dataloadersMappedByParentField = new WeakMap();
	}

	async load<Parent, Child>(child: Type<Child>, params: LoadParams<Parent>): Promise<Child>;
	async load<Parent, Child>(child: [Type<Child>], params: LoadParams<Parent>): Promise<Child[]>;
	async load<Parent, Child>(child: Type<Child> | [Type<Child>], params: LoadParams<Parent>): Promise<Child | Child[]> {
		const { key, metadata, args } = this.extractMetadata(child, params);
		const dataloader = this.getOrCreateDataloader(params, metadata, ...args);
		return dataloader.load(key);
	}

	private extractMetadata<Parent, Child>(child: Type<Child> | [Type<Child>], params: LoadParams<Parent>) {
		const isArray = Array.isArray(child);
		const actualChild = isArray ? child[0] : child;

		const { by, from, field } = params;
		const metadataMap = this.dataloaderMetadataService.getMetadata(from, actualChild);

		if (!metadataMap) {
			throw new Error(`cannot find metadata for ${from.name} -> ${actualChild.name}`);
		}

		if (!field && metadataMap.size > 1) {
			throw new Error(
				`multiple relations found between ${from.name} and ${actualChild.name}, please provide the 'field' option.`,
			);
		}

		const metadata: RelationMetadata = metadataMap.get(field) || metadataMap.values().next().value;
		const [parent, args = []] = by;
		const key = DataloaderMapper.resolvePath(parent, metadata.by);

		return {
			key,
			metadata,
			args,
		};
	}

	private getOrCreateDataloader(params: LoadParams<any>, metadata: RelationMetadata, ...args: Array<unknown>) {
		const field = params.field || metadata.field;
		let parentDataloaderMap = this.dataloadersMappedByParentField.get(params.from);

		if (!parentDataloaderMap) {
			parentDataloaderMap = new Map();
			this.dataloadersMappedByParentField.set(params.from, parentDataloaderMap);
		}

		let foundDataloader = parentDataloaderMap.get(field);

		if (!foundDataloader) {
			foundDataloader = this.createDataloader(metadata, ...args);
			parentDataloaderMap.set(field, foundDataloader);
		}

		return foundDataloader;
	}

	private createDataloader(metadata: RelationMetadata, ...args: Array<unknown>) {
		const provider = this.dataloaderMetadataService.getDataloaderHandler(metadata.on);

		if (!provider) {
			throw new Error(`cannot find provider: ${metadata.on}`);
		}

		const resolvedProvider = this.dataloaderMetadataService.getAlias(provider.provide);

		const repository = this.moduleRef.get(resolvedProvider || provider.provide, { strict: false });

		/**
		 * PS: using strict: false allows us to load all providers from the module globally or not
		 * using strict: true will only load providers from the current module
		 * however, it's not possible to use providers imported from other modules
		 * using "import" statement, but it's possible to use providers using "providers"
		 * option in the module registration;
		 *
		 * Is not recommended to use moduleRef in the constructor: https://github.com/nestjs/nest/issues/4368
		 * The module should be used in onModuleInit lifecycle hook, this way dependencies are resolved correctly;
		 *
		 */

		if (!repository) {
			throw new Error(`cannot find provider: ${provider.provide.name}`);
		}

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
