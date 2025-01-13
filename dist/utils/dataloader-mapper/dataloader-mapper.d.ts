import { JoinProperty, LoadedRelationship } from "../../types/dataloader.types";
/**
 * Class to map the entities to the keys used in the dataloader.
 * Uses the metadata to know how to map the entities, like paths and relation type.
 */
export declare class DataloaderMapper {
    static map(metadata: LoadedRelationship, keys: Array<JoinProperty>, entities: Array<unknown>): any[];
    private static oneToMany;
    private static oneToOne;
}
