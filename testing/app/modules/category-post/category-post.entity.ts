import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField } from "decorated-factory";

@ObjectType()
export class CategoryPostEntity {
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999 }))
	@Field(() => Int)
	id: number;

	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999 }))
	@Field(() => Int)
	postId: number;

	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999 }))
	@Field(() => Int)
	categoryId: number;
}
