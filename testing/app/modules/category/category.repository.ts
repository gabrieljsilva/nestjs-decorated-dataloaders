import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "src";
import { LOAD_CATEGORY_BY_POSTS } from "testing/app/constants";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class CategoryRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	async find() {
		return this.database.getCategories();
	}

	@DataloaderHandler(LOAD_CATEGORY_BY_POSTS)
	async loadCategoryByPostsIds(postsIds: number[]) {
		const categoryPosts = this.database.getCategoryPosts().filter((cp) => postsIds.includes(cp.postId));
		const categories = this.database.getCategories();

		const filtered = categories.filter((category) => categoryPosts.some((cp) => cp.categoryId === category.id));

		for (const category of filtered) {
			category.categoryPosts = categoryPosts.filter((cp) => cp.categoryId === category.id);
		}

		return filtered;
	}
}
