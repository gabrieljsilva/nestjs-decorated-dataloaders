import { ChildFN } from "../../types/dataloader.types";
import { Paths } from "../../types/paths.type";
interface LoadOptions<Child, Parent> {
    key: Paths<Parent>;
    parentKey: Paths<Child>;
    handler: string;
}
export declare function Load<Child, Parent = any>(child: ChildFN<Child>, options: LoadOptions<Child, Parent>): (target: NonNullable<any>, propertyKey: string) => void;
export {};
