import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserGroupEntity {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	userId: number;

	@Field(() => Int)
	groupId: number;
}
