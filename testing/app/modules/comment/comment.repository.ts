import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "../../../../src";
import { LOAD_COMMENTS_BY_POSTS } from "../../constants";
import { DatabaseService } from "../database/database.service";
import { CommentEntity } from "./comment.entity";

@Injectable()
export class CommentRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	async findComments() {
		return this.database.getComments();
	}

	@DataloaderHandler(LOAD_COMMENTS_BY_POSTS)
	async findByPostIds(postIds: number[]): Promise<CommentEntity[]> {
		const comments = this.database.getComments();
		return comments.filter((comment) => postIds.includes(comment.postId));
	}
}
