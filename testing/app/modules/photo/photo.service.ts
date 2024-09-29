import { Inject, Injectable } from "@nestjs/common";
import { PhotoRepository } from "./photo.repository";

@Injectable()
export class PhotoService {
	constructor(
		@Inject(PhotoRepository)
		private readonly photoRepository: PhotoRepository,
	) {}

	async findAll() {
		return this.photoRepository.find();
	}
}
