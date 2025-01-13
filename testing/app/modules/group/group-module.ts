import { Module } from "@nestjs/common";
import { GroupRepository } from "./group.repository";

@Module({
	imports: [],
	providers: [GroupRepository],
	exports: [GroupRepository],
})
export class GroupModule {}
