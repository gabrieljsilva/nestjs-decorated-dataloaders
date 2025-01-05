import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CategoryEntity } from "./category.entity";

@Injectable()
export class CategoryService {
    constructor(
        @Inject(CategoryRepository)
        private readonly categoryRepository: CategoryRepository
    ) {}

    async getCategories(): Promise<CategoryEntity[]> {
        return this.categoryRepository.find();
    }
}
