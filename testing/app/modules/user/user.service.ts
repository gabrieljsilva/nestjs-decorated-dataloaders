import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
	constructor(
		@Inject(UserRepository)
		private readonly userRepository: UserRepository,
	) {}

	async findAll() {
		return this.userRepository.find();
	}
}
