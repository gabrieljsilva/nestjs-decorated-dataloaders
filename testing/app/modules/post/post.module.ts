import { Module } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { PostResolver } from "./post.resolver";
import { PostService } from "./post.service";

@Module({
	imports: [],
	providers: [PostResolver, PostService, PostRepository],
	exports: [],
})
export class PostModule {}
