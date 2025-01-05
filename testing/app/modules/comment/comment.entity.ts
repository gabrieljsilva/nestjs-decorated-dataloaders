import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FactoryField, FactoryRelationField } from "decorated-factory";
import { LOAD_POSTS_BY_COMMENTS } from "testing/app/constants";
import { Load } from "../../../../src/decorators/load.decorator";
import { PostEntity } from "../post/post.entity";

@ObjectType()
export class CommentEntity {
	@Field(() => Int)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 99999 }))
	id: number;

	@Field(() => String)
	@FactoryField((faker) => faker.lorem.sentence())
	text: string;

	@Field(() => PostEntity)
	@FactoryRelationField(() => PostEntity)
	@Load(() => PostEntity, { key: "postId", parentKey: "id", handler: LOAD_POSTS_BY_COMMENTS })
	post: PostEntity;

	@Field(() => Number)
	@FactoryField((faker) => faker.number.int({ min: 1, max: 99999 }))
	postId: number;
}
