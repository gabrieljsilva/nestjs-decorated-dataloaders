import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "../../../../src";
import { LOAD_GROUPS_BY_USERS } from "../../constants";
import { DatabaseService } from "../database/database.service";
import { UserGroupEntity } from "../user-group/user-group.entity";

@Injectable()
export class GroupRepository {
	constructor(
		@Inject(DatabaseService)
		private readonly database: DatabaseService,
	) {}

	@DataloaderHandler(LOAD_GROUPS_BY_USERS)
	async findByUsersIds(usersIds: number[]) {
		const groups = this.database.getGroups();
		return groups.map((group) => {
			group.userGroups = usersIds.map((userId) => {
				const userGroup = new UserGroupEntity();
				userGroup.userId = userId;
				userGroup.groupId = group.id;
				return userGroup;
			});
			return group;
		});
	}
}
