import { faker } from "@faker-js/faker";
import { Factory, FactoryField } from "decorated-factory";
import { bench } from "vitest";
import { resolvePath } from "./resolve-path";

class UserEntity {
	@FactoryField((faker) => faker.number.int({ min: 1, max: 99999 }))
	id: number;

	@FactoryField((faker) => faker.person.fullName())
	name: string;

	@FactoryField((faker) => faker.date.past())
	createdAt: Date;
}

describe("resolvePath", () => {
	const factory = new Factory(faker);
	const users = factory.newList(UserEntity, 1000);

	bench("benchmarking of resolve paths", () => {
		for (const user of users) {
			resolvePath(user, "id");
		}
	});
});
