import { Module } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
	providers: [UserService, UserResolver, UserRepository],
})
export class UserModule {}
