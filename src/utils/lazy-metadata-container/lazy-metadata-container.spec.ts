import { expect } from "vitest";
import {
	AliasForReturnFn,
	DataloaderHandlerMetadata,
	HandlerKey,
	RelationType,
	Relationship,
} from "../../types/dataloader.types";
import { LazyMetadataContainer } from "./lazy-metadata-container";

describe("LazyMetadataContainer", () => {
	beforeEach(() => {
		LazyMetadataContainer.clear();
	});

	it("should add and load relationship metadata for one-to-one relationship", () => {
		class Owner {
			id: number;
			name: string;
		}

		class Dog {
			id: number;
			name: string;
		}

		const relationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => Dog,
			key: "dogId",
			parentKey: "id",
			handler: "findDogById",
			originalFieldName: "dog",
		};

		LazyMetadataContainer.addRelationshipMetadata(relationship);
		LazyMetadataContainer.loadRelationshipMetadata();

		const loadedRelationships = LazyMetadataContainer.loadedRelationships;
		const ownerRelations = loadedRelationships.get(Owner);
		const dogRelation = ownerRelations?.get("dog");

		expect(dogRelation).toBeDefined();
		expect(dogRelation?.type).toBe(RelationType.OneToOne);
		expect(dogRelation?.parent).toBe(Owner);
		expect(dogRelation?.child).toBe(Dog);
		expect(dogRelation?.key).toBe("dogId");
		expect(dogRelation?.parentKey).toBe("id");
		expect(dogRelation?.handler).toBe("findDogById");
	});

	it("should add and load relationship metadata for one-to-many relationship", () => {
		class Dog {
			id: number;
			name: string;
		}

		class Toy {
			id: number;
			type: string;
		}

		const relationship: Relationship = {
			parentFN: () => Dog,
			explicitChildFN: () => [Toy],
			key: "dogId",
			parentKey: "id",
			handler: "findToysByDogId",
			originalFieldName: "toys",
		};

		LazyMetadataContainer.addRelationshipMetadata(relationship);
		LazyMetadataContainer.loadRelationshipMetadata();

		const loadedRelationships = LazyMetadataContainer.loadedRelationships;
		const dogRelations = loadedRelationships.get(Dog);
		const toysRelation = dogRelations?.get("toys");

		expect(toysRelation).toBeDefined();
		expect(toysRelation?.type).toBe(RelationType.OneToMany);
		expect(toysRelation?.parent).toBe(Dog);
		expect(toysRelation?.child).toBe(Toy);
	});

	it("should add and load alias metadata", () => {
		class Dog {
			id: number;
			name: string;
		}

		class DogHandler {
			handle() {}
		}

		const aliasFunction: AliasForReturnFn = () => DogHandler;

		LazyMetadataContainer.addAliasMetadata(aliasFunction, Dog);
		LazyMetadataContainer.loadAliasMetadata();

		const loadedAliases = LazyMetadataContainer.loadedAliases;
		expect(loadedAliases.get(Dog)).toBe(DogHandler);
	});

	it("should add dataloader handler metadata", () => {
		class Dog {
			id: number;
			name: string;
		}

		class DogHandler {
			handle() {}
		}

		const handlerKey: HandlerKey = "findDogById";

		const metadata: DataloaderHandlerMetadata = {
			provide: DogHandler,
			field: "handle",
		};

		LazyMetadataContainer.addDataloaderHandlerMetadata(handlerKey, metadata);

		const handler = LazyMetadataContainer.dataloaderHandlers.get(handlerKey);
		expect(handler).toBeDefined();
		expect(handler).toEqual(metadata);
	});

	it("should handle multiple relationships for the same parent", () => {
		class Owner {
			id: number;
			name: string;
		}

		class Dog {
			id: number;
			name: string;
		}

		class Toy {
			id: number;
			type: string;
		}

		const dogRelationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => Dog,
			key: "dogId",
			parentKey: "id",
			handler: "findDogById",
			originalFieldName: "dog",
		};

		const toysRelationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => [Toy],
			key: "ownerId",
			parentKey: "id",
			handler: "findToysByOwnerId",
			originalFieldName: "toys",
		};

		LazyMetadataContainer.addRelationshipMetadata(dogRelationship);
		LazyMetadataContainer.addRelationshipMetadata(toysRelationship);
		LazyMetadataContainer.loadRelationshipMetadata();

		const ownerRelations = LazyMetadataContainer.loadedRelationships.get(Owner);
		expect(ownerRelations?.size).toBe(2);
		expect(ownerRelations?.get("dog")).toBeDefined();
		expect(ownerRelations?.get("toys")).toBeDefined();
	});

	it("should clear all metadata", () => {
		class Owner {
			id: number;
			name: string;
		}

		class Dog {
			id: number;
			name: string;
		}

		class DogHandler {
			handle() {}
		}

		const relationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => Dog,
			key: "dogId",
			parentKey: "id",
			handler: "findDogById",
			originalFieldName: "dog",
		};

		const aliasFunction: AliasForReturnFn = () => DogHandler;
		const handlerKey: HandlerKey = "findDogById";
		const metadata: DataloaderHandlerMetadata = {
			provide: DogHandler,
			field: "handle",
		};

		LazyMetadataContainer.addRelationshipMetadata(relationship);
		LazyMetadataContainer.addAliasMetadata(aliasFunction, Dog);
		LazyMetadataContainer.addDataloaderHandlerMetadata(handlerKey, metadata);
		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadAliasMetadata();
		LazyMetadataContainer.clear();

		expect(LazyMetadataContainer.loadedRelationships.size).toBe(0);
		expect(LazyMetadataContainer.loadedAliases.size).toBe(0);
		expect(LazyMetadataContainer.dataloaderHandlers.size).toBe(0);
	});

	it("should not override existing relationships when loading new ones", () => {
		class Owner {
			id: number;
			name: string;
		}

		class Dog {
			id: number;
			name: string;
		}

		class Toy {
			id: number;
			type: string;
		}

		const firstRelationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => Dog,
			key: "dogId",
			parentKey: "id",
			handler: "findDogById",
			originalFieldName: "dog",
		};

		const secondRelationship: Relationship = {
			parentFN: () => Owner,
			explicitChildFN: () => [Toy],
			key: "ownerId",
			parentKey: "id",
			handler: "findToysByOwnerId",
			originalFieldName: "toys",
		};

		LazyMetadataContainer.addRelationshipMetadata(firstRelationship);
		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.addRelationshipMetadata(secondRelationship);
		LazyMetadataContainer.loadRelationshipMetadata();

		const ownerRelations = LazyMetadataContainer.loadedRelationships.get(Owner);
		expect(ownerRelations?.size).toBe(2);
		expect(ownerRelations?.get("dog")?.handler).toBe("findDogById");
		expect(ownerRelations?.get("toys")?.handler).toBe("findToysByOwnerId");
	});

	it("should handle circular relationships", () => {
		class Parent {
			id: number;
			childId: number;
		}

		class Child {
			id: number;
			parentId: number;
		}

		const parentToChildRelationship: Relationship = {
			parentFN: () => Parent,
			explicitChildFN: () => Child,
			key: "childId",
			parentKey: "id",
			handler: "findChildById",
			originalFieldName: "child",
		};

		const childToParentRelationship: Relationship = {
			parentFN: () => Child,
			explicitChildFN: () => Parent,
			key: "parentId",
			parentKey: "id",
			handler: "findParentById",
			originalFieldName: "parent",
		};

		LazyMetadataContainer.addRelationshipMetadata(parentToChildRelationship);
		LazyMetadataContainer.addRelationshipMetadata(childToParentRelationship);
		LazyMetadataContainer.loadRelationshipMetadata();

		const parentRelations = LazyMetadataContainer.loadedRelationships.get(Parent);
		const childRelations = LazyMetadataContainer.loadedRelationships.get(Child);

		expect(parentRelations?.get("child")?.type).toBe(RelationType.OneToOne);
		expect(childRelations?.get("parent")?.type).toBe(RelationType.OneToOne);
	});

	it("should handle multiple dataloader handlers for the same provider", () => {
		class UserHandler {
			findById() {}
			findByEmail() {}
		}

		const findByIdMetadata: DataloaderHandlerMetadata = {
			provide: UserHandler,
			field: "findById",
		};

		const findByEmailMetadata: DataloaderHandlerMetadata = {
			provide: UserHandler,
			field: "findByEmail",
		};

		LazyMetadataContainer.addDataloaderHandlerMetadata("findById", findByIdMetadata);
		LazyMetadataContainer.addDataloaderHandlerMetadata("findByEmail", findByEmailMetadata);

		expect(LazyMetadataContainer.dataloaderHandlers.get("findById")).toBeDefined();
		expect(LazyMetadataContainer.dataloaderHandlers.get("findByEmail")).toBeDefined();
	});

	it("should handle multiple aliases for the same type", () => {
		class User {
			id: number;
		}

		class UserHandlerV1 {
			handle() {}
		}

		class UserHandlerV2 {
			handle() {}
		}

		const aliasV1: AliasForReturnFn = () => UserHandlerV1;
		const aliasV2: AliasForReturnFn = () => UserHandlerV2;

		LazyMetadataContainer.addAliasMetadata(aliasV1, User);
		LazyMetadataContainer.loadAliasMetadata();

		LazyMetadataContainer.addAliasMetadata(aliasV2, User);
		LazyMetadataContainer.loadAliasMetadata();

		expect(LazyMetadataContainer.loadedAliases.get(User)).toBe(UserHandlerV2);
	});

	it("should handle deep nested relationships", () => {
		class Company {
			id: number;
		}

		class Department {
			id: number;
			companyId: number;
		}

		class Employee {
			id: number;
			departmentId: number;
		}

		class Project {
			id: number;
			employeeId: number;
		}

		const companyToDepartmentRelation: Relationship = {
			parentFN: () => Company,
			explicitChildFN: () => [Department],
			key: "companyId",
			parentKey: "id",
			handler: "findDepartmentsByCompanyId",
			originalFieldName: "departments",
		};

		const departmentToEmployeeRelation: Relationship = {
			parentFN: () => Department,
			explicitChildFN: () => [Employee],
			key: "departmentId",
			parentKey: "id",
			handler: "findEmployeesByDepartmentId",
			originalFieldName: "employees",
		};

		const employeeToProjectRelation: Relationship = {
			parentFN: () => Employee,
			explicitChildFN: () => [Project],
			key: "employeeId",
			parentKey: "id",
			handler: "findProjectsByEmployeeId",
			originalFieldName: "projects",
		};

		LazyMetadataContainer.addRelationshipMetadata(companyToDepartmentRelation);
		LazyMetadataContainer.addRelationshipMetadata(departmentToEmployeeRelation);
		LazyMetadataContainer.addRelationshipMetadata(employeeToProjectRelation);
		LazyMetadataContainer.loadRelationshipMetadata();

		const companyRelations = LazyMetadataContainer.loadedRelationships.get(Company);
		const departmentRelations = LazyMetadataContainer.loadedRelationships.get(Department);
		const employeeRelations = LazyMetadataContainer.loadedRelationships.get(Employee);

		expect(companyRelations?.get("departments")?.type).toBe(RelationType.OneToMany);
		expect(departmentRelations?.get("employees")?.type).toBe(RelationType.OneToMany);
		expect(employeeRelations?.get("projects")?.type).toBe(RelationType.OneToMany);
	});

	it("should handle reloading metadata multiple times", () => {
		class User {
			id: number;
		}

		class Post {
			id: number;
			userId: number;
		}

		const relationship: Relationship = {
			parentFN: () => User,
			explicitChildFN: () => [Post],
			key: "userId",
			parentKey: "id",
			handler: "findPostsByUserId",
			originalFieldName: "posts",
		};

		LazyMetadataContainer.addRelationshipMetadata(relationship);
		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations?.size).toBe(1);
		expect(userRelations?.get("posts")?.type).toBe(RelationType.OneToMany);
	});

	it("should throw an error if same handler is added", () => {
		class UserHandlerV1 {
			findById() {}
		}

		class UserHandlerV2 {
			findById() {}
		}

		const handlerKey: HandlerKey = "findById";

		const metadataV1: DataloaderHandlerMetadata = {
			provide: UserHandlerV1,
			field: "findById",
		};

		const metadataV2: DataloaderHandlerMetadata = {
			provide: UserHandlerV2,
			field: "findById",
		};

		try {
			LazyMetadataContainer.addDataloaderHandlerMetadata(handlerKey, metadataV1);
			LazyMetadataContainer.addDataloaderHandlerMetadata(handlerKey, metadataV2);
		} catch (e) {
			expect(e.message).toBe("Dataloader handler with key findById already exists");
		}
	});
});
