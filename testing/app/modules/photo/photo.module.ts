import { Module } from "@nestjs/common";
import { PhotoRepository } from "./photo.repository";
import { PhotoResolver } from "./photo.resolver";
import { PhotoService } from "./photo.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
	providers: [PhotoRepository, PhotoService, PhotoResolver],
})
export class PhotoModule {}
