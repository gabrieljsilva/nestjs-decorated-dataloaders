import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { PostRepository } from "./post.repository";
import { PostResolver } from "./post.resolver";
import { PostService } from "./post.service";

@Module({
	imports: [DatabaseModule],
	providers: [PostResolver, PostService, PostRepository],
	exports: [],
})
export class PostModule {}
