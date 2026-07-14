import { Constructor } from "./constructor.type";
import { Paths } from "./paths.type";

export enum RelationType {
	OneToOne = "OneToOne",
	OneToMany = "OneToMany",
}

export type JoinProperty = string | number;
export type AliasForReturnFn = <T = any>() => Constructor<T> | Function;
export type ParentFN<T = unknown> = () => Constructor<T>;
export type ChildFN<T = unknown> = () => Constructor<T> | [Constructor<T>];
export type MapperFN<T = any> = (entity: T) => JoinProperty | JoinProperty[];

export interface DataloaderHandlerMetadata {
	provide: Constructor;
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
	parent: Constructor;
	child: Constructor;
}

export type FieldName = string;
export type LoadedRelationships = Map<Constructor, Map<FieldName, LoadedRelationship<any, any>>>;
export type HandlerKey = string;
export interface LoadOptions<Child, Parent> {
	key: Paths<Parent> | MapperFN<Parent>;
	parentKey: Paths<Child> | MapperFN<Child>;
	handler: string;
}

export type PropertyType<T, K extends keyof T> = T[K];

export interface CommonLoadParams<Parent> {
	from: Constructor<Parent>;
	args?: any[];
}

export interface LoadParams<Parent, Field extends keyof Parent> extends CommonLoadParams<Parent> {
	field: Field;
	parent: Parent;
}
