import Dataloader, { CacheMap } from "dataloader";
import {
	DataloaderNotFoundError,
	FieldMetadataNotFoundError,
	HandlerNotFoundError,
	HandlerProviderNotFoundError,
	ParentMetadataNotFoundError,
} from "../errors";
import { Constructor } from "../types/constructor.type";
import { JoinProperty, LoadParams, LoadedRelationship, PropertyType } from "../types/dataloader.types";
import { LazyMetadataContainer } from "../utils";
import { DataloaderMapper } from "../utils/dataloader-mapper";
import { resolvePath } from "../utils/resolve-paths";
import { HandlerResolver } from "./handler-resolver";

export interface DataloaderCacheOptions {
	/**
	 * Factory for the Dataloader cacheMap. It is invoked once PER DATALOADER (per relation, per
	 * context/request) and MUST return a NEW instance on every call — returning a shared instance
	 * would leak cached entries across requests/contexts.
	 */
	getCacheMap?: () => CacheMap<any, any>;
	cache?: boolean;
	maxBatchSize?: number;
	name?: string;
}

export interface DataloaderContextOptions extends DataloaderCacheOptions {
	handlerResolver: HandlerResolver;
}

/**
 * Holds the dataloaders of a single loading scope (typically one request):
 * one Dataloader instance per relation, created lazily on first load.
 */
export class DataloaderContext {
	private readonly dataloadersMappedByParentField: WeakMap<Constructor, Map<string, Dataloader<JoinProperty, any>>>;
	private readonly handlerResolver: HandlerResolver;
	private readonly cacheOptions: DataloaderCacheOptions;

	constructor(options: DataloaderContextOptions) {
		const { handlerResolver, ...cacheOptions } = options;
		this.handlerResolver = handlerResolver;
		this.cacheOptions = cacheOptions;
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
		params: Omit<LoadParams<Parent, Field>, "parent"> & { parent: Parent[] },
	): Promise<Array<PropertyType<Parent, Field> | Error>> {
		const { from, field, parent: parents, args } = params;

		if (!parents.length) {
			return [];
		}

		const { metadata, fieldName } = this.extractMetadata({
			from,
			field,
			parent: parents[0],
			args,
		});

		const dataloader = this.getOrCreateDataloader(from, fieldName as string, metadata, args);
		const keys = parents.map((parent) => resolvePath(parent, metadata.key));
		// Dataloader#loadMany resolves per-key failures as Error entries instead of rejecting
		return dataloader.loadMany(keys) as Promise<Array<PropertyType<Parent, Field> | Error>>;
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

		for (const dataloader of this.getDataloadersOrThrowError(from, fieldName as string)) {
			dataloader.clear(resolvedKey);
		}
	}

	clearAll<Parent, Field extends keyof Parent>(params: Pick<LoadParams<Parent, Field>, "from" | "field">) {
		const { from } = params;

		for (const dataloader of this.getDataloadersOrThrowError(from, params.field as string)) {
			dataloader.clearAll();
		}
	}

	private extractMetadata<Parent, Field extends keyof Parent>(params: LoadParams<Parent, Field>) {
		const relationships = LazyMetadataContainer.loadedRelationships;
		const parentMetadataMap = relationships.get(params.from);

		if (!parentMetadataMap) {
			throw new ParentMetadataNotFoundError({ parent: params.from.name });
		}

		const fieldMetadata = parentMetadataMap.get(params.field as string);

		if (!fieldMetadata) {
			throw new FieldMetadataNotFoundError({ parent: params.from.name, field: String(params.field) });
		}

		const resolvedKey = resolvePath(params.parent, fieldMetadata.key);

		return {
			resolvedKey,
			metadata: fieldMetadata,
			fieldName: params.field,
		};
	}

	// a dataloader is cached per field AND per args, since args are baked into its batch function
	private static dataloaderKey(fieldName: string, args?: any[]) {
		return `${fieldName}\u0000${serializeArgs(args)}`;
	}

	private getDataloadersOrThrowError<Parent>(parent: Constructor<Parent>, fieldName: string) {
		const parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);
		const keyPrefix = `${fieldName}\u0000`;

		const dataloaders = parentDataloaderMap
			? [...parentDataloaderMap.entries()].filter(([key]) => key.startsWith(keyPrefix)).map(([, value]) => value)
			: [];

		if (!dataloaders.length) {
			throw new DataloaderNotFoundError({ parent: parent.name });
		}

		return dataloaders;
	}

	private getOrCreateDataloader<Parent>(
		parent: Constructor<Parent>,
		fieldName: string,
		metadata: LoadedRelationship,
		args?: any[],
	) {
		let parentDataloaderMap = this.dataloadersMappedByParentField.get(parent);

		if (!parentDataloaderMap) {
			parentDataloaderMap = new Map();
			this.dataloadersMappedByParentField.set(parent, parentDataloaderMap);
		}

		const key = DataloaderContext.dataloaderKey(fieldName, args);
		let foundDataloader = parentDataloaderMap.get(key);

		if (!foundDataloader) {
			foundDataloader = this.createDataloader(metadata, args);
			parentDataloaderMap.set(key, foundDataloader);
		}

		return foundDataloader;
	}

	private createDataloader(metadata: LoadedRelationship, args = []) {
		const { repository, provider } = this.findMetadataHandlerByName(metadata.handler);

		const fetchRecords = async (keys: Array<JoinProperty>) => {
			return repository[provider.field](keys, ...args) as unknown[];
		};

		const batchFunction = async (keys: ReadonlyArray<JoinProperty>) => {
			const entities = await fetchRecords(keys as Array<JoinProperty>);
			return DataloaderMapper.map(metadata, keys as Array<JoinProperty>, entities);
		};

		return new Dataloader<JoinProperty, any>(batchFunction, {
			cache: this.cacheOptions.cache,
			name: this.cacheOptions.name,
			maxBatchSize: this.cacheOptions.maxBatchSize,
			cacheMap: this.cacheOptions.getCacheMap?.(),
		});
	}

	private findMetadataHandlerByName(handlerName: string) {
		const provider = LazyMetadataContainer.dataloaderHandlers.get(handlerName);

		if (!provider) {
			throw new HandlerNotFoundError({ handler: handlerName });
		}

		const resolvedProvider = LazyMetadataContainer.loadedAliases.get(provider.provide);
		const repository = this.handlerResolver.resolveInstance(resolvedProvider || provider.provide);

		if (!repository) {
			throw new HandlerProviderNotFoundError({ provider: provider.provide.name });
		}

		return {
			repository,
			provider,
		};
	}
}

function serializeArgs(args?: any[]) {
	if (!args?.length) {
		return "";
	}

	try {
		// lossy values (function/symbol/bigint/undefined) don't throw on JSON.stringify but would
		// collapse into the same key, leaking cache between distinct args — serialize them explicitly
		return JSON.stringify(args, (_, value) => {
			const type = typeof value;

			if (type === "function") {
				return identityOf(value);
			}

			if (type === "symbol" || type === "bigint") {
				return String(value);
			}

			if (value === undefined) {
				return "undefined";
			}

			return value;
		});
	} catch {
		// non-serializable args (circular refs, etc.): fall back to identity, since
		// String(obj) would collapse distinct objects into "[object Object]" and leak cache between them
		return args.map((arg) => identityOf(arg)).join(",");
	}
}

let identitySequence = 0;
const identityIds = new WeakMap<object, number>();

function identityOf(arg: unknown) {
	const isReferenceType = (typeof arg === "object" && arg !== null) || typeof arg === "function";

	if (!isReferenceType) {
		return String(arg);
	}

	if (!identityIds.has(arg as object)) {
		identityIds.set(arg as object, ++identitySequence);
	}

	return `ref#${identityIds.get(arg as object)}`;
}
