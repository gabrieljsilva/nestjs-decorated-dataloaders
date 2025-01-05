import { Inject } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "../../../../src";
import { CommentEntity } from "../comment/comment.entity";
import { PostEntity } from "./post.entity";
import { PostService } from "./post.service";

@Resolver(() => PostEntity)
export class PostResolver {
	constructor(
		@Inject(PostService)
		private postService: PostService,
		@Inject(DataloaderService)
		private readonly dataloaderService: DataloaderService,
	) {}

	@Query(() => [PostEntity])
	async posts() {
		return this.postService.getPosts();
	}

	@ResolveField(() => [CommentEntity])
	async comments(@Parent() post: PostEntity) {
		return this.dataloaderService.load([CommentEntity], { from: PostEntity, by: [post] });
	}
}
