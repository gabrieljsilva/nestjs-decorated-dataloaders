import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { DataloaderHandler } from "../../../../src";
import { LOAD_GROUPS_BY_USERS } from "../../constants";
import { GroupEntity } from "./group.entity";

@Injectable()
export class GroupRepository {
	// Simulate a database query to find groups by users ids
	// and return a list of groups with user groups filtered by users ids
	@DataloaderHandler(LOAD_GROUPS_BY_USERS)
	async findByUsersIds(usersIds: number[]) {
		const factory = new Factory(faker);
		const groups = factory.newList(GroupEntity, 10, {
			userGroups: [1],
		});

		return groups.map((group, index) => {
			for (const userGroup of group.userGroups) {
				userGroup.groupId = group.id;
				userGroup.userId = usersIds[index];
			}
			return group;
		});
	}
}
