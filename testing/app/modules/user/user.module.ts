import { Module } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

@Module({
	providers: [UserService, UserResolver, UserRepository],
})
export class UserModule {}
