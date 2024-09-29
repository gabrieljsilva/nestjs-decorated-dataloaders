import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField } from "decorated-factory";
import { LoadMany } from "../../../../src";
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

	@LoadMany(() => PhotoEntity, {
		by: "id",
		where: "userId",
		on: LOAD_PHOTOS_BY_USER,
	})
	photos: Array<PhotoEntity>;

	@LoadMany<GroupEntity, UserEntity>(() => GroupEntity, {
		by: "id",
		where: "userGroups.userId",
		on: LOAD_GROUPS_BY_USERS,
	})
	groups: Array<GroupEntity>;
}
