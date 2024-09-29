import { type DynamicModule } from "@nestjs/common";
import { CacheMapServiceOptions } from "./cache-map.service";
type DataloaderModuleOptions = CacheMapServiceOptions;
export declare class DataloaderModule {
    static forRoot(options?: DataloaderModuleOptions): DynamicModule;
}
export {};
