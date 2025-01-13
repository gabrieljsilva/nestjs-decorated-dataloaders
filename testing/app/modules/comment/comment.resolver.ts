import { Inject } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "../../../../src";
import { PostEntity } from "../post/post.entity";
import { CommentEntity } from "./comment.entity";
import { CommentService } from "./comment.service";

@Resolver(() => CommentEntity)
export class CommentResolver {
	constructor(
		@Inject(DataloaderService)
		private readonly dataloaderService: DataloaderService,
		@Inject(CommentService)
		private readonly commentsService: CommentService,
	) {}

	@Query(() => [CommentEntity])
	async comments() {
		return this.commentsService.findComments();
	}

	@ResolveField(() => PostEntity)
	async post(@Parent() comment: CommentEntity) {
		return this.dataloaderService.load({ from: CommentEntity, field: "post", data: comment });
	}
}
