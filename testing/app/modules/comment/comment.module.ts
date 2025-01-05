import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CommentRepository } from "./comment.repository";
import { CommentResolver } from "./comment.resolver";
import { CommentService } from "./comment.service";

@Module({
	imports: [DatabaseModule],
	providers: [CommentService, CommentRepository, CommentResolver],
	exports: [CommentService],
})
export class CommentModule {}
