import { Inject } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "../../../../src";
import { GroupEntity } from "../group/group.entity";
import { PhotoEntity } from "../photo/photo.entity";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";

@Resolver(UserEntity)
export class UserResolver {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(DataloaderService)
		private readonly dataloaderService: DataloaderService,
	) {}

	@Query(() => [UserEntity])
	async users() {
		return this.userService.findAll();
	}

	@ResolveField(() => [PhotoEntity])
	async photos(@Parent() user: UserEntity) {
		return this.dataloaderService.load(PhotoEntity, { from: UserEntity, by: [user] });
	}

	@ResolveField(() => [GroupEntity])
	async groups(@Parent() user: UserEntity) {
		return this.dataloaderService.load(GroupEntity, { from: UserEntity, by: [user] });
	}
}
