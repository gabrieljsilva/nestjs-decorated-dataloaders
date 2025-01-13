import { Inject } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "../../../../src";
import { CategoryEntity } from "../category/category.entity";
import { CommentEntity } from "../comment/comment.entity";
import { PostEntity } from "./post.entity";
import { PostService } from "./post.service";

@Resolver(() => PostEntity)
export class PostResolver {
	constructor(
		@Inject(PostService)
		private readonly postService: PostService,
		@Inject(DataloaderService)
		private readonly dataloaderService: DataloaderService,
	) {}

	@Query(() => [PostEntity])
	async posts() {
		return this.postService.getPosts();
	}

	@ResolveField(() => [CommentEntity])
	async comments(@Parent() post: PostEntity) {
		return this.dataloaderService.load({ from: PostEntity, field: "comments", data: post });
	}

	@ResolveField(() => [CategoryEntity])
	async categories(@Parent() post: PostEntity) {
		return this.dataloaderService.load({ from: PostEntity, field: "categories", data: post });
	}
}
