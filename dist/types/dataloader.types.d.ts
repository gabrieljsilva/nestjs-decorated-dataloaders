import { Type } from "@nestjs/common";
import { Paths } from "./paths.type";
export declare enum RelationType {
    OneToOne = "OneToOne",
    OneToMany = "OneToMany"
}
export type JoinProperty = string | number;
export type AliasForReturnFn = <T = any>() => Type<T> | Function;
export type ParentFN<T = unknown> = () => Type<T>;
export type ChildFN<T = unknown> = () => Type<T> | [Type<T>];
export type MapperFN<T = any> = (entity: T) => JoinProperty | JoinProperty[];
export interface DataloaderHandlerMetadata {
    provide: Type;
    field: string;
}
export interface CommonRelationshipOptions<Parent = any, Child = any> {
    key: Paths<Parent> | MapperFN<Parent>;
    parentKey: Paths<Child> | MapperFN<Child>;
    handler: string;
}
export interface Relationship<Parent = any, Child = any> extends CommonRelationshipOptions<Parent, Child> {
    parentFN: ParentFN<Parent>;
    explicitChildFN: ChildFN<Child>;
    originalFieldName: string;
    type?: RelationType;
}
export interface LoadedRelationship<Parent = any, Child = any> extends CommonRelationshipOptions<Parent, Child> {
    type: RelationType;
    parent: Type;
    child: Type;
}
export type FieldName = string;
export type LoadedRelationships = Map<Type, Map<FieldName, LoadedRelationship<any, any>>>;
export type HandlerKey = string;
export interface LoadOptions<Child, Parent> {
    key: Paths<Parent> | MapperFN<Parent>;
    parentKey: Paths<Child> | MapperFN<Child>;
    handler: string;
}
export type PropertyType<T, K extends keyof T> = T[K];
export interface CommonLoadParams<Parent> {
    from: Type<Parent>;
    args?: any[];
}
export interface LoadParams<Parent, Field extends keyof Parent> extends CommonLoadParams<Parent> {
    field: Field;
    data: Parent;
}
