import { Inject, Injectable } from "@nestjs/common";
import { PostEntity } from "./post.entity";
import { PostRepository } from "./post.repository";

@Injectable()
export class PostService {
	constructor(
		@Inject(PostRepository)
		private postRepository: PostRepository,
	) {}

	async getPosts(): Promise<PostEntity[]> {
		return this.postRepository.find();
	}
}
