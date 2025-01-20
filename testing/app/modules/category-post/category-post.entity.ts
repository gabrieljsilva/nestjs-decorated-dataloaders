import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { CategoryEntity } from "../category/category.entity";
import { PostEntity } from "../post/post.entity";

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

	@FactoryRelationField(() => CategoryEntity, { key: "categoryId", inverseKey: "id" })
	category?: CategoryEntity;

	@FactoryRelationField(() => PostEntity, { key: "postId", inverseKey: "id" })
	post?: PostEntity;
}
