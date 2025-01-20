import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryRelationField } from "decorated-factory";
import { GroupEntity } from "../group/group.entity";
import { UserEntity } from "../user/user.entity";

@ObjectType()
export class UserGroupEntity {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	userId: number;

	@Field(() => Int)
	groupId: number;

	@FactoryRelationField(() => UserEntity, { key: "userId", inverseKey: "id" })
	user?: UserEntity;

	@FactoryRelationField(() => GroupEntity, { key: "groupId", inverseKey: "id" })
	group?: GroupEntity;
}
