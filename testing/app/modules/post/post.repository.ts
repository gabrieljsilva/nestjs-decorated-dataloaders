import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "../../../../src";
import { LOAD_POSTS_BY_COMMENTS } from "../../constants";
import { DatabaseService } from "../database/database.service";
import { PostEntity } from "./post.entity";

@Injectable()
export class PostRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	async find(): Promise<PostEntity[]> {
		return this.database.getPosts();
	}

	@DataloaderHandler(LOAD_POSTS_BY_COMMENTS)
	async findPostsByCommentIds(commentsIds: number[]): Promise<PostEntity[]> {
		return this.database.getPosts().filter((post) => commentsIds.includes(post.id));
	}
}
