import type { Type } from "@nestjs/common";
import { dataloaderMetadata } from "../constants";
import { RelationMetadata, RelationType } from "../types/dataloader.types";
import { Paths } from "../types/paths.type";

interface LoadOptions<Child, Parent> {
	key: Paths<Parent>;
	parentKey: Paths<Child>;
	handler: string;
}

export type RelationNodeFn<Of = any> = () => Type<Of> | [Type<Of>];

export function Load<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadOptions<Child, Parent>) {
	const { key, parentKey, handler } = options;
	return (target: NonNullable<any>, propertyKey: string) => {
		const parent = target.constructor as Type;

		type FN<Of> = () => Type<Of>;

		const isArray = Array.isArray(child());

		const childFn: FN<Child> = isArray ? () => child()[0] : () => child();

		dataloaderMetadata.AddRelationMetadata(
			() => parent,
			childFn,
			propertyKey,
			new RelationMetadata({
				by: key,
				where: parentKey,
				type: isArray ? RelationType.OneToMany : RelationType.OneToOne,
				on: handler,
				field: propertyKey,
			}),
		);
	};
}
