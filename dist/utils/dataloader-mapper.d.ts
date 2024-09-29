import { JoinProperty, RelationMetadata } from "../types/dataloader.types";
export declare class DataloaderMapper {
    static map(metadata: RelationMetadata, keys: Array<JoinProperty>, entities: Array<unknown>): any[];
    private static oneToMany;
    private static oneToOne;
    static resolvePath(entity: any, path: string): any;
}
