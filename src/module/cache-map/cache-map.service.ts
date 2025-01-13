import { Injectable } from "@nestjs/common";
import { CacheMap } from "dataloader";

export interface CacheMapServiceOptions {
	getCacheMap?: () => CacheMap<any, any>;
	cache?: boolean;
	maxBatchSize?: number;
	name?: string;
}

/**
 * Service to manage the cacheMap options of the Dataloader;
 */

@Injectable()
export class CacheMapService {
	getCacheMap?: () => CacheMap<any, any>;
	cache?: boolean;
	maxBatchSize?: number;
	name?: string;

	constructor(options?: CacheMapServiceOptions) {
		this.name = options?.name;
		this.cache = options?.cache;
		this.maxBatchSize = options?.maxBatchSize;
		this.getCacheMap = options?.getCacheMap;
	}
}
