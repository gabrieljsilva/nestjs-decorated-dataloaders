import { DuplicatedDataloaderHandlerError } from "../../errors";
import { Constructor } from "../../types/constructor.type";
import {
	AliasForReturnFn,
	DataloaderHandlerMetadata,
	HandlerKey,
	LoadedRelationships,
	RelationType,
	Relationship,
} from "../../types/dataloader.types";

export class LazyMetadataContainer {
	private static unloadedRelationships: Array<Relationship> = [];
	private static unloadedAliases: Map<AliasForReturnFn, Constructor> = new Map();

	public static loadedRelationships: LoadedRelationships = new Map();
	public static loadedAliases: Map<Constructor, Constructor | Function> = new Map();
	public static dataloaderHandlers: Map<HandlerKey, DataloaderHandlerMetadata> = new Map();

	static addRelationshipMetadata<Parent, Child>(params: Relationship<Parent, Child>) {
		LazyMetadataContainer.unloadedRelationships.push(params);
	}

	static addAliasMetadata(alias: AliasForReturnFn, type: Constructor) {
		LazyMetadataContainer.unloadedAliases.set(alias, type);
	}

	static addDataloaderHandlerMetadata(key: HandlerKey, metadata: DataloaderHandlerMetadata) {
		const exists = LazyMetadataContainer.dataloaderHandlers.has(key);

		if (exists) {
			throw new DuplicatedDataloaderHandlerError({ key });
		}

		LazyMetadataContainer.dataloaderHandlers.set(key, metadata);
	}

	static loadRelationshipMetadata() {
		for (const unloadedRelationship of LazyMetadataContainer.unloadedRelationships) {
			const parent = unloadedRelationship.parentFN();
			const child = unloadedRelationship.explicitChildFN();
			const isArray = Array.isArray(child);

			const metadata = {
				parent,
				child: isArray ? child[0] : child,
				key: unloadedRelationship.key,
				parentKey: unloadedRelationship.parentKey,
				handler: unloadedRelationship.handler,
				type: isArray ? RelationType.OneToMany : RelationType.OneToOne,
			};

			const isRelationAdded = LazyMetadataContainer.loadedRelationships.has(parent);

			if (!isRelationAdded) {
				LazyMetadataContainer.loadedRelationships.set(parent, new Map());
			}

			LazyMetadataContainer.loadedRelationships.get(parent)?.set(unloadedRelationship.originalFieldName, metadata);
		}

		// drain the queue so repeated inits don't reprocess already-loaded metadata
		LazyMetadataContainer.unloadedRelationships = [];
	}

	static loadAliasMetadata() {
		for (const [alias, type] of LazyMetadataContainer.unloadedAliases) {
			LazyMetadataContainer.loadedAliases.set(type, alias());
		}

		LazyMetadataContainer.unloadedAliases.clear();
	}

	/**
	 * Removes all items or resets the current state to its initial state.
	 * Used in tests scenarios
	 */
	static clear() {
		LazyMetadataContainer.unloadedRelationships = [];
		LazyMetadataContainer.unloadedAliases.clear();
		LazyMetadataContainer.loadedRelationships.clear();
		LazyMetadataContainer.loadedAliases.clear();
		LazyMetadataContainer.dataloaderHandlers.clear();
	}
}
