import { Module } from "@nestjs/common";
import { GroupRepository } from "./group.repository";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
	providers: [GroupRepository],
	exports: [GroupRepository],
})
export class GroupModule {}
