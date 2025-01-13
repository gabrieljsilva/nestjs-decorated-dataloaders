import { Module } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";

@Module({
	imports: [],
	providers: [CategoryService, CategoryRepository],
	exports: [CategoryService],
})
export class CategoryModule {}
