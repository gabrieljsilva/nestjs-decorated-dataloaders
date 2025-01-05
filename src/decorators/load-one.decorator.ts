import type { Type } from "@nestjs/common";
import { dataloaderMetadata } from "../constants";
import { RelationMetadata, RelationNodeFn, RelationType } from "../types/dataloader.types";
import { Paths } from "../types/paths.type";

interface LoadOneOptions<Child, Parent> {
	by: Paths<Parent>;
	where: Paths<Child>;
	on: string;
}

/**
 *
 * @deprecated this decorator is deprecated in favor of "Load" decorator.
 * this feature will be removed in the next major release
 *
 * @description Decorator to define a oneToOne relation between two entities.
 * by: the path to the parent entity used to join the child entity
 * where: the path to the child entity used to join the parent entity
 * on: the name of the DataloaderHandler used to load the data from some datasource
 */
export function LoadOne<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadOneOptions<Child, Parent>) {
	const { by, where, on } = options;
	return (target: NonNullable<any>, propertyKey: string) => {
		const parent = target.constructor as Type;

		dataloaderMetadata.AddRelationMetadata(
			() => parent,
			child,
			propertyKey,
			new RelationMetadata({
				by: by,
				where: where,
				type: RelationType.OneToOne,
				on: on,
				field: propertyKey,
			}),
		);
	};
}
