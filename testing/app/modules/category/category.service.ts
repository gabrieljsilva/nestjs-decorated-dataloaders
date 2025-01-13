import { Inject, Injectable } from "@nestjs/common";
import { CategoryEntity } from "./category.entity";
import { CategoryRepository } from "./category.repository";

@Injectable()
export class CategoryService {
	constructor(
		@Inject(CategoryRepository)
		private readonly categoryRepository: CategoryRepository,
	) {}

	async getCategories(): Promise<CategoryEntity[]> {
		return this.categoryRepository.find();
	}
}
