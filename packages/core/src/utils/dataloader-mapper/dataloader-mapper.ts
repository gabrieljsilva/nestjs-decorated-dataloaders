import { InvalidBatchResultError } from "../../errors";
import { JoinProperty, LoadedRelationship, RelationType } from "../../types/dataloader.types";
import { resolvePath } from "../resolve-paths";

/**
 * Class to map the entities to the keys used in the dataloader.
 * Uses the metadata to know how to map the entiies, like paths and relation type.
 */
export class DataloaderMapper {
	static map(metadata: LoadedRelationship, keys: Array<JoinProperty>, entities: Array<unknown>) {
		if (!Array.isArray(entities)) {
			throw new InvalidBatchResultError({ received: entities === null ? "null" : typeof entities });
		}

		if (metadata.type === RelationType.OneToOne) {
			return DataloaderMapper.oneToOne(metadata, keys, entities);
		}

		return DataloaderMapper.oneToMany(metadata, keys, entities);
	}

	private static oneToMany(metadata: LoadedRelationship, keys: Array<JoinProperty>, entities: Array<unknown>) {
		const entitiesMappedByKey = new Map<JoinProperty, Array<any>>();
		const path = metadata.parentKey;

		for (const entity of entities) {
			const joinKeyOrKeys = resolvePath(entity, path);
			const isArray = Array.isArray(joinKeyOrKeys);

			if (isArray) {
				for (const key of joinKeyOrKeys) {
					if (!entitiesMappedByKey.has(key)) {
						entitiesMappedByKey.set(key, []);
					}
					entitiesMappedByKey.get(key).push(entity);
				}

				continue;
			}
			if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
				entitiesMappedByKey.set(joinKeyOrKeys, []);
			}
			entitiesMappedByKey.get(joinKeyOrKeys).push(entity);
		}

		return keys.map((key) => entitiesMappedByKey.get(key) || []);
	}

	private static oneToOne(metadata: LoadedRelationship, keys: Array<JoinProperty>, entities: Array<unknown>) {
		const entitiesMappedByKey = new Map<JoinProperty, any>();

		for (const entity of entities) {
			const joinKeyOrKeys = resolvePath(entity, metadata.parentKey);
			const isArray = Array.isArray(joinKeyOrKeys);

			if (isArray) {
				for (const key of joinKeyOrKeys) {
					if (!entitiesMappedByKey.has(key)) {
						entitiesMappedByKey.set(key, entity);
					}
				}
				continue;
			}
			if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
				entitiesMappedByKey.set(joinKeyOrKeys, entity);
			}
		}

		return keys.map((key) => entitiesMappedByKey.get(key) || null);
	}
}
