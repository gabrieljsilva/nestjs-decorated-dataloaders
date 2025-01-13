import { type DynamicModule, OnModuleInit } from "@nestjs/common";
import { CacheMapServiceOptions } from "../cache-map/cache-map.service";
type DataloaderModuleOptions = CacheMapServiceOptions;
export declare class DataloaderModule implements OnModuleInit {
    static forRoot(options?: DataloaderModuleOptions): DynamicModule;
    onModuleInit(): Promise<void>;
}
export {};
