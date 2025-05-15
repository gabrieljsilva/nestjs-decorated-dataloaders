import { ChildFN, LoadOptions } from "../../types/dataloader.types";
export declare function Load<Child, Parent = any>(child: ChildFN<Child>, options: LoadOptions<Child, Parent>): (target: NonNullable<any>, propertyKey: string) => void;
