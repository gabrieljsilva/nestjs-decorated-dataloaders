import { Inject, Injectable } from "@nestjs/common";
import { CommentRepository } from "./comment.repository";

@Injectable()
export class CommentService {
	constructor(
		@Inject(CommentRepository)
		private commentRepository: CommentRepository,
	) {}

	async findComments() {
		return this.commentRepository.findComments();
	}
}
