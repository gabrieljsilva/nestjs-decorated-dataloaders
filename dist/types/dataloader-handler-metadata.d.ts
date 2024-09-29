import { Type } from "@nestjs/common";
export declare class DataloaderHandlerMetadata {
    provide: Type;
    field: string;
    constructor(provider: Type, field: string);
}
