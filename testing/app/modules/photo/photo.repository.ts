import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "../../../../src";
import { LOAD_PHOTOS_BY_USER } from "../../constants";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class PhotoRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	async find() {
		return this.database.getPhotos();
	}

	@DataloaderHandler(LOAD_PHOTOS_BY_USER)
	async findAllByUsersIds(usersIds: number[]) {
		const photos = this.database.getPhotos();
		return photos.filter((photo) => usersIds.includes(photo.userId));
	}
}
