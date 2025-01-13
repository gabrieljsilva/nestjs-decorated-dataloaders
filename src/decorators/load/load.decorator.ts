import type { Type } from "@nestjs/common";
import { ChildFN } from "../../types/dataloader.types";
import { Paths } from "../../types/paths.type";
import { LazyMetadataContainer } from "../../utils";

interface LoadOptions<Child, Parent> {
	key: Paths<Parent>;
	parentKey: Paths<Child>;
	handler: string;
}

export function Load<Child, Parent = any>(child: ChildFN<Child>, options: LoadOptions<Child, Parent>) {
	const { key, parentKey, handler } = options;
	return (target: NonNullable<any>, propertyKey: string) => {
		const parent = () => target.constructor as Type;

		LazyMetadataContainer.addRelationshipMetadata({
			key: key as string,
			parentKey: parentKey as string,
			handler: handler,
			parentFN: parent,
			explicitChildFN: child,
			originalFieldName: propertyKey,
		});
	};
}
