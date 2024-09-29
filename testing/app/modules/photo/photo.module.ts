import { Module } from "@nestjs/common";
import { PhotoRepository } from "./photo.repository";
import { PhotoResolver } from "./photo.resolver";
import { PhotoService } from "./photo.service";

@Module({
	providers: [PhotoRepository, PhotoService, PhotoResolver],
})
export class PhotoModule {}
