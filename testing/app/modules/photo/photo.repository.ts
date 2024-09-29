import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { DataloaderHandler } from "../../../../src";
import { LOAD_PHOTOS_BY_USER } from "../../constants";
import { PhotoEntity } from "./photo.entity";

@Injectable()
export class PhotoRepository {
	async find() {
		const factory = new Factory(faker);
		return factory.newList(PhotoEntity, 10);
	}

	@DataloaderHandler(LOAD_PHOTOS_BY_USER)
	async findAllByUsersIds(usersIds: number[]) {
		const factory = new Factory(faker);
		return factory.createList(PhotoEntity, 10).override((photos) => {
			photos.forEach((photo, index) => {
				photo.userId = usersIds[index];
			});
			return photos;
		});
	}
}
