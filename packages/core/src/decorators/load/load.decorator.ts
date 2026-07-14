import type { Constructor } from "../../types/constructor.type";
import { ChildFN, LoadOptions } from "../../types/dataloader.types";
import { LazyMetadataContainer } from "../../utils";

export function Load<Child, Parent = any>(child: ChildFN<Child>, options: LoadOptions<Child, Parent>) {
	const { key, parentKey, handler } = options;
	return (target: NonNullable<any>, propertyKey: string) => {
		const parent = () => target.constructor as Constructor;

		LazyMetadataContainer.addRelationshipMetadata<Parent, Child>({
			key: key,
			parentKey: parentKey,
			handler,
			parentFN: parent,
			explicitChildFN: child,
			originalFieldName: propertyKey,
		});
	};
}
