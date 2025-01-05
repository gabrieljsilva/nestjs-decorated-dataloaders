import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { Load } from "src/decorators/load.decorator";
import { LOAD_COMMENTS_BY_POSTS } from "testing/app/constants";
import { CommentEntity } from "../comment/comment.entity";

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
	@FactoryRelationField(() => [CommentEntity])
	comments: CommentEntity[];
}
