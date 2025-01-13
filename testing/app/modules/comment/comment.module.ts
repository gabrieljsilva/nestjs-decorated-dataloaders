import { Module } from "@nestjs/common";
import { CommentRepository } from "./comment.repository";
import { CommentResolver } from "./comment.resolver";
import { CommentService } from "./comment.service";

@Module({
	imports: [],
	providers: [CommentService, CommentRepository, CommentResolver],
	exports: [CommentService],
})
export class CommentModule {}
