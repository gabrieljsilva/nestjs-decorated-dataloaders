import { Type } from "@nestjs/common";
import { Paths } from "./paths.type";

export enum RelationType {
	OneToOne = "OneToOne",
	OneToMany = "OneToMany",
}

export type JoinProperty = string | number;
export type DataloaderKey = string;
export type AliasForReturnFn = () => Type;
export type RelationField = string;
export type RelationNodeFn<Of = any> = () => Type<Of>;

/**
 * Stores metadata about a relation between two entities.
 * type: the type of relation (OneToOne, OneToMany)
 * by: the path to the parent entity used to join the child entity
 * where: the path to the child entity used to join the parent entity
 * field: the field name of the relation
 * on: the name of the DataloaderHandler used to load the data from some datasource
 */
export class RelationMetadata<Child = any, Parent = any> {
	type: RelationType;
	by: Paths<Parent>;
	where: Paths<Child>;
	field?: string;
	on: string;

	constructor(metadata: RelationMetadata<Child, Parent>) {
		this.type = metadata.type;
		this.by = metadata.by;
		this.where = metadata.where;
		this.field = metadata.field;
		this.on = metadata.on;
	}
}
