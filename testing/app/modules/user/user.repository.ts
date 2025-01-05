import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "../../../../src";
import { LOAD_USER_BY_PHOTO } from "../../constants";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class UserRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	async find() {
		return this.database.getUsers();
	}

	@DataloaderHandler(LOAD_USER_BY_PHOTO)
	async findUsersByPhotosIds(photoIds: number[]) {
		const users = this.database.getUsers();
		return users.filter((user) => photoIds.includes(user.id));
	}
}
