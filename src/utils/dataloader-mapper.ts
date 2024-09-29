import { JoinProperty, RelationMetadata, RelationType } from "../types/dataloader.types";

/**
 * Class to map the entities to the keys used in the dataloader.
 * Uses the metadata to know how to map the entities, like paths and relation type.
 */
export class DataloaderMapper {
	static map(metadata: RelationMetadata, keys: Array<JoinProperty>, entities: Array<unknown>) {
		if (metadata.type === RelationType.OneToOne) {
			return DataloaderMapper.oneToOne(metadata, keys, entities);
		}

		return DataloaderMapper.oneToMany(metadata, keys, entities);
	}

	private static oneToMany(metadata: RelationMetadata, keys: Array<JoinProperty>, entities: Array<unknown>) {
		const entitiesMappedByKey = new Map<JoinProperty, Array<any>>();
		const path = metadata.where;

		for (const entity of entities) {
			const joinKeyOrKeys = DataloaderMapper.resolvePath(entity, path);
			const isArray = Array.isArray(joinKeyOrKeys);

			if (isArray) {
				for (const key of joinKeyOrKeys) {
					if (!entitiesMappedByKey.has(key)) {
						entitiesMappedByKey.set(key, []);
					}
					entitiesMappedByKey.get(key).push(entity);
				}
			} else if (joinKeyOrKeys) {
				if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
					entitiesMappedByKey.set(joinKeyOrKeys, []);
				}
				entitiesMappedByKey.get(joinKeyOrKeys).push(entity);
			}
		}

		return keys.map((key) => entitiesMappedByKey.get(key) || []);
	}

	private static oneToOne(metadata: RelationMetadata, keys: Array<JoinProperty>, entities: Array<unknown>) {
		const entitiesMappedByKey = new Map<JoinProperty, any>();

		for (const entity of entities) {
			const joinKeyOrKeys = DataloaderMapper.resolvePath(entity, metadata.where);
			const isArray = Array.isArray(joinKeyOrKeys);

			if (isArray) {
				for (const key of joinKeyOrKeys) {
					if (!entitiesMappedByKey.has(key)) {
						entitiesMappedByKey.set(key, entity);
					}
				}
			} else if (joinKeyOrKeys) {
				if (!entitiesMappedByKey.has(joinKeyOrKeys)) {
					entitiesMappedByKey.set(joinKeyOrKeys, entity);
				}
			}
		}

		return keys.map((key) => entitiesMappedByKey.get(key) || null);
	}

	public static resolvePath(entity: any, path: string) {
		let current = entity;
		let part = "";

		for (let i = 0; i <= path.length; i++) {
			const char = path[i];

			if (char === "." || i === path.length) {
				if (Array.isArray(current)) {
					const results = [];
					for (const item of current) {
						if (item && item[part] !== undefined) {
							results.push(item[part]);
						}
					}
					current = results.length ? results : undefined;
				} else {
					current = current[part];
				}
				part = "";
			} else {
				part += char;
			}
		}

		return current;
	}
}
