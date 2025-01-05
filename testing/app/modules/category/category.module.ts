import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryRepository } from "./category.repository";
import { DatabaseModule } from "../database/database.module";

@Module({
	imports: [DatabaseModule],
	providers: [CategoryService, CategoryRepository],
	exports: [CategoryService],
})
export class CategoryModule {}
