import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { Load } from "../../../../src";
import { LOAD_GROUPS_BY_USERS, LOAD_PHOTOS_BY_USER } from "../../constants";
import { GroupEntity } from "../group/group.entity";
import { PhotoEntity } from "../photo/photo.entity";

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

	@Load(() => [PhotoEntity], {
		key: "id",
		parentKey: "userId",
		handler: LOAD_PHOTOS_BY_USER,
	})
	@FactoryRelationField(() => [PhotoEntity])
	photos: Array<PhotoEntity>;

	@Load(() => [GroupEntity], {
		key: "id",
		parentKey: "userGroups.userId",
		handler: LOAD_GROUPS_BY_USERS,
	})
	groups: Array<GroupEntity>;
}
