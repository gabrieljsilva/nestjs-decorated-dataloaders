import { Type } from "@nestjs/common";
export declare enum RelationType {
    OneToOne = "OneToOne",
    OneToMany = "OneToMany"
}
export type JoinProperty = string | number;
export type AliasForReturnFn = <T = any>() => Type<T> | Function;
export type ParentFN<T = unknown> = () => Type<T>;
export type ChildFN<T = unknown> = () => Type<T> | [Type<T>];
export interface DataloaderHandlerMetadata {
    provide: Type;
    field: string;
}
export interface CommonRelationshipOptions {
    key: string;
    parentKey: string;
    handler: string;
}
export interface Relationship<Parent = any, Child = any> extends CommonRelationshipOptions {
    parentFN: ParentFN<Parent>;
    explicitChildFN: ChildFN<Child>;
    originalFieldName: string;
    type?: RelationType;
}
export interface LoadedRelationship extends CommonRelationshipOptions {
    type: RelationType;
    parent: Type;
    child: Type;
}
export type FielName = string;
export type LoadedRelationships = Map<Type, Map<FielName, LoadedRelationship>>;
export type HandlerKey = string;
