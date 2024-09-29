import { Type } from "@nestjs/common";
import { RelationMetadata, RelationNodeFn, RelationType } from "../types/dataloader.types";
import { Paths } from "../types/paths.type";
import { DataloaderMetadataContainer } from "../utils/dataloader-metadata-container";

interface LoadManyOptions<Child = any, Parent = any> {
	by: Paths<Parent>;
	where: Paths<Child>;
	on: string;
}

/**
 * Decorator to define a OneToMany relation between two entities.
 * by: the path to the parent entity used to join the child entity
 * where: the path to the child entity used to join the parent entity
 * on: the name of the DataloaderHandler used to load the data from some datasource
 */
export function LoadMany<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadManyOptions<Child, Parent>) {
	const { by, where, on } = options;
	return (target: NonNullable<any>, propertyKey: string) => {
		const parent = target.constructor as Type;

		DataloaderMetadataContainer.AddRelationMetadata(
			() => parent,
			child,
			propertyKey,
			new RelationMetadata({
				by: by,
				where: where,
				type: RelationType.OneToMany,
				on: on,
				field: propertyKey,
			}),
		);
	};
}
