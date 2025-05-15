import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { Load } from "../../../src";
import { LOAD_CATEGORY_BY_POSTS, LOAD_COMMENTS_BY_POSTS } from "../constants";
import { CategoryEntity } from "./category.entity";
import { CommentEntity } from "./comment.entity";

@ObjectType()
export class PostEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 99999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.lorem.sentence())
	title: string;

	@Field(() => String)
	@FactoryField((faker) => faker.lorem.paragraph())
	content: string;

	@Field(() => String)
	@FactoryField((faker) => faker.date.past().toISOString())
	createdAt: string;

	@Load(() => [CommentEntity], { key: "id", parentKey: "postId", handler: LOAD_COMMENTS_BY_POSTS })
	@FactoryRelationField(() => [CommentEntity], { key: "id", inverseKey: "postId" })
	comments: CommentEntity[];

	/**
	 * Using Function-Based Path Resolver for tests
	 */
	@Load(() => [CategoryEntity], {
		key: (category) => category.id,
		parentKey: (post) => post.categoryPosts.map((cp) => cp.postId),
		handler: LOAD_CATEGORY_BY_POSTS,
	})
	@FactoryRelationField(() => [CategoryEntity])
	categories: CategoryEntity[];
}
