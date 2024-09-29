import { CacheMap } from "dataloader";
export interface CacheMapServiceOptions {
    getCacheMap?: () => CacheMap<any, any>;
    cache?: boolean;
    maxBatchSize?: number;
    name?: string;
}
export declare class CacheMapService {
    getCacheMap?: () => CacheMap<any, any>;
    cache?: boolean;
    maxBatchSize?: number;
    name?: string;
    constructor(options?: CacheMapServiceOptions);
}
