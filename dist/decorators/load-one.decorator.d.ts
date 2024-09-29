import { RelationNodeFn } from "../types/dataloader.types";
import { Paths } from "../types/paths.type";
interface LoadOneOptions<Child, Parent> {
    by: Paths<Parent>;
    where: Paths<Child>;
    on: string;
}
export declare function LoadOne<Child, Parent = any>(child: RelationNodeFn<Child>, options: LoadOneOptions<Child, Parent>): (target: NonNullable<any>, propertyKey: string) => void;
export {};
