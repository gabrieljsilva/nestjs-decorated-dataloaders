import { type DynamicModule } from "@nestjs/common";
import { CacheMapServiceOptions } from "./cache-map.service";
interface DataloaderModuleOptions {
    global?: boolean;
    dataloaderOptions?: CacheMapServiceOptions;
}
export declare class DataloaderModule {
    static register(options?: DataloaderModuleOptions): DynamicModule;
}
export {};
