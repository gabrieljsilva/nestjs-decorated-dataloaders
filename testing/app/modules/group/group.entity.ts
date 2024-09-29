import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { UserGroupEntity } from "../user-group/user-group.entity";

@ObjectType()
export class GroupEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.lorem.word())
	name: string;

	@FactoryRelationField(() => [UserGroupEntity])
	userGroups: Array<UserGroupEntity>;
}
