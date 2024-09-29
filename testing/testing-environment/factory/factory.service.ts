import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";

@Injectable()
export class FactoryService {
	public readonly factory: Factory;

	constructor() {
		this.factory = new Factory(faker);
	}
}
