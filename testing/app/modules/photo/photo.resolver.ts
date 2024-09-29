import { Inject } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "../../../../src";
import { UserEntity } from "../user/user.entity";
import { PhotoEntity } from "./photo.entity";
import { PhotoService } from "./photo.service";

@Resolver(PhotoEntity)
export class PhotoResolver {
	constructor(
		@Inject(PhotoService)
		private readonly photoService: PhotoService,

		@Inject(DataloaderService)
		private readonly dataloaderService: DataloaderService,
	) {}

	@Query(() => [PhotoEntity])
	async photos() {
		return this.photoService.findAll();
	}

	@ResolveField(() => UserEntity)
	async user(@Parent() photo: PhotoEntity) {
		return this.dataloaderService.load(UserEntity, { from: PhotoEntity, by: [photo] });
	}
}
