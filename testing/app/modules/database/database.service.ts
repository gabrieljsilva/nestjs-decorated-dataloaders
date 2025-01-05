import { fakerPT_BR } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { PostEntity } from "../post/post.entity";

@Injectable()
export class DatabaseService {
	private data = this.generateData();
	private generateData() {
		const factory = new Factory(fakerPT_BR);

		const posts = factory
			.createList(PostEntity, 3, {
				comments: [3],
			})
			.override((posts) => {
				for (const post of posts) {
					for (const comment of post.comments) {
						comment.postId = post.id;
					}
				}

				return posts;
			});

		const comments = posts.flatMap((post) => post.comments);

		for (const post of posts) {
			post.comments = undefined;
		}

		return {
			posts,
			comments,
		};
	}

	public getPosts() {
		return this.data.posts;
	}

	public getComments() {
		return this.data.comments;
	}
}
