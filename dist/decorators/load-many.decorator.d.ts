import { RelationNodeFn } from "../types/dataloader.types";
import { Paths } from "../types/paths.type";
interface LoadManyOptions<Child = any, Parent = any> {
    by: Paths<Parent>;
    where: Paths<Child>;
    on: string;
}
export declare function LoadMany<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadManyOptions<Child, Parent>): (target: NonNullable<any>, propertyKey: string) => void;
export {};
