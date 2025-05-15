import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { Load } from "../../../src";
import { LOAD_GROUPS_BY_USERS, LOAD_PHOTOS_BY_USER } from "../constants";
import { GroupEntity } from "./group.entity";
import { PhotoEntity } from "./photo.entity";

@ObjectType()
export class UserEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.person.fullName())
	name: string;

	@Field(() => Date)
	@FactoryField((faker) => faker.date.past())
	createdAt: Date;

	/**
	 * Using Function-Based Path Resolver for tests
	 */
	@Load<PhotoEntity, UserEntity>(() => [PhotoEntity], {
		key: (user) => user.id,
		parentKey: (photo) => photo.userId,
		handler: LOAD_PHOTOS_BY_USER,
	})
	@FactoryRelationField(() => [PhotoEntity], { key: "id", inverseKey: "userId" })
	photos: Array<PhotoEntity>;

	@Load(() => [GroupEntity], { key: "id", parentKey: "userGroups.userId", handler: LOAD_GROUPS_BY_USERS })
	groups: Array<GroupEntity>;
}
