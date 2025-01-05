import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { CategoryPostEntity } from "../category-post/category-post.entity";

@ObjectType()
export class CategoryEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 999999999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.lorem.word())
	name: string;

	@FactoryRelationField(() => [CategoryPostEntity])
	categoryPosts: CategoryPostEntity[];
}
