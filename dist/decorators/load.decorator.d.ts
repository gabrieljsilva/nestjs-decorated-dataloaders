import type { Type } from "@nestjs/common";
import { Paths } from "../types/paths.type";
interface LoadOptions<Child, Parent> {
    key: Paths<Parent>;
    parentKey: Paths<Child>;
    handler: string;
}
export type RelationNodeFn<Of = any> = () => Type<Of> | [Type<Of>];
export declare function Load<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadOptions<Child, Parent>): (target: NonNullable<any>, propertyKey: string) => void;
export {};
