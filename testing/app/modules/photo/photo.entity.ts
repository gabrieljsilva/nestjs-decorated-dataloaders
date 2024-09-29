import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { LoadOne } from "../../../../src";
import { LOAD_USER_BY_PHOTO } from "../../constants";
import { UserEntity } from "../user/user.entity";

@ObjectType()
export class PhotoEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.image.url())
	url: string;

	@Field(() => Number)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999 }))
	userId: number;

	@FactoryRelationField(() => UserEntity)
	@LoadOne(() => UserEntity, {
		by: "userId",
		where: "id",
		on: LOAD_USER_BY_PHOTO,
	})
	user: UserEntity;
}
