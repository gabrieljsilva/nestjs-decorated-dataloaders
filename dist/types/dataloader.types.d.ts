import { Type } from "@nestjs/common";
import { Paths } from "./paths.type";
export declare enum RelationType {
    OneToOne = "OneToOne",
    OneToMany = "OneToMany"
}
export type JoinProperty = string | number;
export type DataloaderKey = string;
export type AliasForReturnFn = <T = any>() => Type<T> | Function;
export type RelationField = string;
export type RelationNodeFn<Of = any> = () => Type<Of>;
export declare class RelationMetadata<Child = any, Parent = any> {
    type: RelationType;
    by: Paths<Parent>;
    where: Paths<Child>;
    field?: string;
    on: string;
    constructor(metadata: RelationMetadata<Child, Parent>);
}
