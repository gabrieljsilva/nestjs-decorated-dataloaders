import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { DataloaderHandler } from "../../../../src";
import { LOAD_USER_BY_PHOTO } from "../../constants";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserRepository {
	async find() {
		const factory = new Factory(faker);
		return factory.newList(UserEntity, 10);
	}

	@DataloaderHandler(LOAD_USER_BY_PHOTO)
	async findUsersByPhotosIds(photoIds: number[]) {
		const factory = new Factory(faker);
		return factory.createList(UserEntity, 10).override((users) => {
			users.forEach((user, index) => {
				user.id = photoIds[index];
			});
			return users;
		});
	}
}
