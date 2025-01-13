import { fakerPT_BR } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { Factory, FactoryField, FactoryRelationField } from "decorated-factory";
import { DataloaderHandler, Load } from "../../decorators";
import { LazyMetadataContainer } from "../../utils";
import { CacheMapService } from "../cache-map";
import { ExplorerService } from "../explorer-service";
import { DataloaderService } from "./dataloader.service";

describe("DataloaderService", () => {
	const factory = new Factory(fakerPT_BR);
	let moduleRef: any;
	let explorerService: ExplorerService;
	let dataloaderService: DataloaderService;
	let cacheMapService: CacheMapService;

	beforeEach(async () => {
		moduleRef = await Test.createTestingModule({
			providers: [
				DataloaderService,
				CacheMapService,
				{
					provide: ExplorerService,
					useValue: {
						findMetadataHandlerByName: vi.fn(),
					},
				},
			],
		}).compile();

		LazyMetadataContainer.clear();
		explorerService = moduleRef.get(ExplorerService);
		dataloaderService = await moduleRef.resolve(DataloaderService);
		cacheMapService = moduleRef.get(CacheMapService);
	});

	it("should load one-to-many relationships", async () => {
		const handlerName = "LOAD_PHOTOS_BY_USER_ID";

		class Photo {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.image.url())
			url: string;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			userId: number;
		}

		class User {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.person.fullName())
			name: string;

			@Load(() => [Photo], {
				key: "id",
				parentKey: "userId",
				handler: handlerName,
			})
			photos: Photo[];
		}

		class PhotoRepository {
			@DataloaderHandler(handlerName)
			static async loadByUserIds(userIds: number[]) {
				return userIds.flatMap((userId) => {
					return factory.createList(Photo, 3).override((photos) => {
						for (const photo of photos) {
							photo.userId = userId;
						}
						return photos;
					});
				});
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: PhotoRepository,
			provider: {
				provide: PhotoRepository,
				field: "loadByUserIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const users = factory.newList(User, 3);
		const results = await Promise.all(
			users.map((user) => dataloaderService.load({ from: User, field: "photos", data: user })),
		);

		expect(results).toHaveLength(3);
		for (const [index, photos] of results.entries()) {
			for (const photo of photos) {
				expect(photo.userId).toBe(users[index].id);
			}
		}
	});

	it("should load one-to-one relationships", async () => {
		const handlerName = "LOAD_PROFILE_BY_USER_ID";

		class Profile {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.lorem.sentence())
			bio: string;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			userId: number;
		}

		class User {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.person.fullName())
			name: string;

			@Load(() => Profile, {
				key: "id",
				parentKey: "userId",
				handler: handlerName,
			})
			profile: Profile;
		}

		class ProfileRepository {
			@DataloaderHandler(handlerName)
			static async loadByUserIds(userIds: number[]) {
				return userIds.map((userId) => factory.create(Profile).override(() => ({ userId })));
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: ProfileRepository,
			provider: {
				provide: ProfileRepository,
				field: "loadByUserIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const users = factory.newList(User, 3);
		const results = await Promise.all(
			users.map((user) => dataloaderService.load({ from: User, field: "profile", data: user })),
		);

		expect(results).toHaveLength(3);
		for (const profile of results) {
			expect(profile).toBeInstanceOf(Profile);
		}
	});

	it("should load one-to-many relationships by intermediate entity", async () => {
		const handlerName = "LOAD_TAGS_BY_PROJECT_ID";

		class ProjectTag {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			projectId: number;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			tagId: number;
		}

		class Tag {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.lorem.words({ min: 5, max: 10 }))
			description: string;

			@FactoryRelationField(() => [ProjectTag])
			projectTags: ProjectTag[];
		}

		class Project {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.company.name()) // Nome do projeto
			name: string;

			@FactoryRelationField(() => [ProjectTag])
			projectTags: ProjectTag[];

			@Load(() => [Tag], {
				key: "id",
				parentKey: "projectTags.projectId",
				handler: handlerName,
			})
			tags: Tag[];
		}

		class TagByProjectRepository {
			@DataloaderHandler(handlerName)
			static async loadByProjectIds(projectIds: number[]) {
				const tagsWithProjectTags: Tag[] = [];

				for (const projectId of projectIds) {
					const tags = factory
						.createList(Tag, 3, {
							projectTags: [1],
						})
						.override((tags) => {
							for (const tag of tags) {
								for (const projectTag of tag.projectTags) {
									projectTag.projectId = projectId;
									projectTag.tagId = tag.id;
								}
							}

							return tags;
						});

					tagsWithProjectTags.push(...tags);
				}

				return tagsWithProjectTags;
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: TagByProjectRepository,
			provider: {
				provide: TagByProjectRepository,
				field: "loadByProjectIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const projects = factory.newList(Project, 3);

		const results = await Promise.all(
			projects.map((project) =>
				dataloaderService.load({
					from: Project,
					field: "tags",
					data: project,
				}),
			),
		);

		expect(results).toHaveLength(projects.length);

		const tags = results.flat();

		for (const tag of tags) {
			expect(tag).toBeInstanceOf(Tag);
		}
	});
	it("should load one-to-one relationships by an intermediate entity", async () => {
		const handlerName = "LOAD_ADDRESS_BY_COMPANY_ID";

		class CompanyAddress {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			companyId: number;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			addressId: number;
		}

		class Address {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.location.streetAddress())
			street: string;

			@FactoryField((faker) => faker.location.city())
			city: string;

			@FactoryField((faker) => faker.location.zipCode())
			zipCode: string;

			@FactoryRelationField(() => CompanyAddress)
			companyAddress: CompanyAddress;
		}

		class Company {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.company.name())
			name: string;

			@Load(() => Address, {
				key: "id",
				parentKey: "companyAddress.companyId",
				handler: handlerName,
			})
			address: Address;

			@FactoryRelationField(() => CompanyAddress)
			companyAddress: CompanyAddress;
		}

		class AddressRepository {
			@DataloaderHandler(handlerName)
			static async loadByCompanyIds(companyIds: number[]) {
				const addressesWithCompanyAddresses: Address[] = [];

				for (const companyId of companyIds) {
					const address = factory
						.create(Address, {
							companyAddress: true,
						})
						.override((address) => {
							address.companyAddress.companyId = companyId;
							address.companyAddress.addressId = address.id;
							return address;
						});

					addressesWithCompanyAddresses.push(address);
				}

				return addressesWithCompanyAddresses;
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: AddressRepository,
			provider: {
				provide: AddressRepository,
				field: "loadByCompanyIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const companies = factory.newList(Company, 3);

		const results = await Promise.all(
			companies.map((company) =>
				dataloaderService.load({
					from: Company,
					field: "address",
					data: company,
				}),
			),
		);

		expect(results).toHaveLength(companies.length);
		for (const address of results) {
			expect(address).toBeInstanceOf(Address);
		}
	});

	it("should clear all cached entries for a specific parent and field", async () => {
		const handlerName = "LOAD_PRODUCTS_BY_CART_ID";

		class Product {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.commerce.productName())
			name: string;

			@FactoryField((faker) => faker.commerce.price())
			price: string;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			cartId: number;
		}

		class Cart {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@Load(() => [Product], {
				key: "id",
				parentKey: "cartId",
				handler: handlerName,
			})
			products: Product[];
		}

		class ProductRepository {
			@DataloaderHandler(handlerName)
			static async loadByCartIds(cartIds: number[]) {
				return cartIds.flatMap((cartId) => {
					return factory.createList(Product, 3).override((products) => {
						for (const product of products) {
							product.cartId = cartId;
						}
						return products;
					});
				});
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: ProductRepository,
			provider: {
				provide: ProductRepository,
				field: "loadByCartIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const cart = factory.new(Cart);

		const initialProducts = await dataloaderService.load({
			from: Cart,
			field: "products",
			data: cart,
		});

		expect(initialProducts.length).toBeGreaterThan(0);
		for (const product of initialProducts) {
			expect(product.cartId).toBe(cart.id);
		}

		dataloaderService.clearAll({
			from: Cart,
			field: "products",
			data: cart,
		});

		const loadByCartIdsSpy = vi.spyOn(ProductRepository, "loadByCartIds");

		const reloadedProducts = await dataloaderService.load({
			from: Cart,
			field: "products",
			data: cart,
		});

		expect(loadByCartIdsSpy).toHaveBeenCalledWith([cart.id]);

		expect(reloadedProducts.length).toBeGreaterThan(0);
		for (const product of reloadedProducts) {
			expect(product.cartId).toBe(cart.id);
		}
	});

	it("should clear specific entries without affecting other cached entries", async () => {
		const handlerName = "LOAD_STUDENTS_BY_SCHOOL_ID";

		class Student {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.person.firstName())
			firstName: string;

			@FactoryField((faker) => faker.person.lastName())
			lastName: string;

			@FactoryField((faker) => faker.number.int({ min: 14, max: 19 }))
			age: number;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			schoolId: number;

			@FactoryField((faker) => faker.helpers.arrayElement(["9th", "10th", "11th", "12th"]))
			grade: string;
		}

		class School {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => `${faker.company.name()} High School`)
			name: string;

			@FactoryField((faker) => faker.location.city())
			city: string;

			@FactoryField((faker) => faker.location.state())
			state: string;

			@Load(() => [Student], {
				key: "id",
				parentKey: "schoolId",
				handler: handlerName,
			})
			students: Student[];
		}

		class StudentRepository {
			@DataloaderHandler(handlerName)
			static async loadBySchoolIds(schoolIds: number[]) {
				return schoolIds.flatMap((schoolId) => {
					return factory.createList(Student, 3).override((students) => {
						for (const student of students) {
							student.schoolId = schoolId;
						}
						return students;
					});
				});
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: StudentRepository,
			provider: {
				provide: StudentRepository,
				field: "loadBySchoolIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const berkeleyHigh = factory.create(School).override(() => ({
			name: "Berkeley High School",
			city: "Berkeley",
			state: "California",
		}));

		const oaklandTech = factory.create(School).override(() => ({
			name: "Oakland Technical High School",
			city: "Oakland",
			state: "California",
		}));

		// Initial load for both schools to populate cache
		const loadBySchoolIdsSpy = vi.spyOn(StudentRepository, "loadBySchoolIds");

		// Load students for both schools
		const [berkeleyStudents, oaklandStudents] = await Promise.all([
			dataloaderService.load({
				from: School,
				field: "students",
				data: berkeleyHigh,
			}),
			dataloaderService.load({
				from: School,
				field: "students",
				data: oaklandTech,
			}),
		]);

		// Verify initial loads
		expect(berkeleyStudents.length).toBe(3);
		expect(oaklandStudents.length).toBe(3);
		expect(loadBySchoolIdsSpy).toHaveBeenCalledTimes(1); // Batched into single call

		// Clear cache only for Berkeley High
		dataloaderService.clear({
			from: School,
			field: "students",
			data: berkeleyHigh,
		});

		// Reset the spy to track new calls
		loadBySchoolIdsSpy.mockClear();

		// Reload students for both schools
		const [reloadedBerkeleyStudents, reloadedOaklandStudents] = await Promise.all([
			dataloaderService.load({
				from: School,
				field: "students",
				data: berkeleyHigh,
			}),
			dataloaderService.load({
				from: School,
				field: "students",
				data: oaklandTech,
			}),
		]);

		// Verify that only Berkeley High's data was reloaded
		expect(loadBySchoolIdsSpy).toHaveBeenCalledTimes(1);
		expect(loadBySchoolIdsSpy).toHaveBeenCalledWith([berkeleyHigh.id]);

		// Oakland Tech's students should be from cache (strictly equal)
		expect(reloadedOaklandStudents).toBe(oaklandStudents);

		// Berkeley High's students should be new (not strictly equal)
		expect(reloadedBerkeleyStudents).not.toBe(berkeleyStudents);

		// Verify the reloaded data is still valid
		expect(reloadedBerkeleyStudents.length).toBe(3);
		for (const student of reloadedBerkeleyStudents) {
			expect(student.schoolId).toBe(berkeleyHigh.id);
			expect(student).toBeInstanceOf(Student);
			expect(typeof student.firstName).toBe("string");
			expect(typeof student.lastName).toBe("string");
			expect(student.age).toBeGreaterThanOrEqual(14);
			expect(student.age).toBeLessThanOrEqual(19);
			expect(["9th", "10th", "11th", "12th"]).toContain(student.grade);
		}

		for (const student of reloadedOaklandStudents) {
			expect(student.schoolId).toBe(oaklandTech.id);
			expect(student).toBeInstanceOf(Student);
		}
	});

	it("should correctly prime the dataloader with new values", async () => {
		const handlerName = "LOAD_EMPLOYEES_BY_DEPARTMENT_ID";

		class Employee {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.person.firstName())
			firstName: string;

			@FactoryField((faker) => faker.person.lastName())
			lastName: string;

			@FactoryField((faker) => faker.phone.number())
			phoneNumber: string;

			@FactoryField((faker) => faker.internet.email())
			email: string;

			@FactoryField((faker) => faker.helpers.arrayElement(["Junior", "Senior", "Lead", "Manager"]))
			role: string;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			departmentId: number;
		}

		class Department {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.commerce.department())
			name: string;

			@FactoryField((faker) => faker.location.buildingNumber())
			buildingNumber: string;

			@FactoryField((faker) => faker.company.catchPhrase())
			description: string;

			@Load(() => [Employee], {
				key: "id",
				parentKey: "departmentId",
				handler: handlerName,
			})
			employees: Employee[];
		}

		class EmployeeRepository {
			@DataloaderHandler(handlerName)
			static async loadByDepartmentIds(departmentIds: number[]) {
				return departmentIds.flatMap((departmentId) => {
					return factory.createList(Employee, 5).override((employees) => {
						for (const employee of employees) {
							employee.departmentId = departmentId;
						}
						return employees;
					});
				});
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: EmployeeRepository,
			provider: {
				provide: EmployeeRepository,
				field: "loadByDepartmentIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const department = factory.create(Department).override(() => ({
			name: "Research & Development",
			buildingNumber: "42",
			description: "Innovation Hub",
		}));

		const customTeam = factory.createList(Employee, 3, {}).override((employees) => {
			const teamData = [
				{
					firstName: "Alice",
					lastName: "Smith",
					role: "Lead",
					email: "alice@company.com",
				},
				{
					firstName: "Bob",
					lastName: "Johnson",
					role: "Senior",
					email: "bob@company.com",
				},
				{
					firstName: "Charlie",
					lastName: "Williams",
					role: "Junior",
					email: "charlie@company.com",
				},
			];

			return employees.map((employee, index) => ({
				...employee,
				...teamData[index],
				departmentId: department.id,
			}));
		});

		// Prime the dataloader with the custom team
		dataloaderService.prime(
			{
				from: Department,
				field: "employees",
				data: department,
			},
			customTeam,
		);

		// Spy on repository to ensure it's not called
		const loadByDepartmentIdsSpy = vi.spyOn(EmployeeRepository, "loadByDepartmentIds");

		// Load the employees - should come from primed cache
		const loadedEmployees = await dataloaderService.load({
			from: Department,
			field: "employees",
			data: department,
		});

		// Verify the repository was not called
		expect(loadByDepartmentIdsSpy).not.toHaveBeenCalled();

		// Verify we got our primed team
		expect(loadedEmployees).toBe(customTeam);
		expect(loadedEmployees).toHaveLength(3);
		expect(loadedEmployees).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					firstName: "Alice",
					lastName: "Smith",
					role: "Lead",
					email: "alice@company.com",
					departmentId: department.id,
				}),
				expect.objectContaining({
					firstName: "Bob",
					lastName: "Johnson",
					role: "Senior",
					email: "bob@company.com",
					departmentId: department.id,
				}),
				expect.objectContaining({
					firstName: "Charlie",
					lastName: "Williams",
					role: "Junior",
					email: "charlie@company.com",
					departmentId: department.id,
				}),
			]),
		);

		// Create another department
		const anotherDepartment = factory.new(Department);

		// Load employees for another department - should hit repository
		await dataloaderService.load({
			from: Department,
			field: "employees",
			data: anotherDepartment,
		});

		// Verify repository was called for the non-primed department
		expect(loadByDepartmentIdsSpy).toHaveBeenCalledTimes(1);
		expect(loadByDepartmentIdsSpy).toHaveBeenCalledWith([anotherDepartment.id]);

		// Clear the primed value
		dataloaderService.clear({
			from: Department,
			field: "employees",
			data: department,
		});

		// Reset spy
		loadByDepartmentIdsSpy.mockClear();

		// Load again - should hit repository now
		const reloadedEmployees = await dataloaderService.load({
			from: Department,
			field: "employees",
			data: department,
		});

		// Verify repository was called after clearing
		expect(loadByDepartmentIdsSpy).toHaveBeenCalledTimes(1);
		expect(loadByDepartmentIdsSpy).toHaveBeenCalledWith([department.id]);

		// Verify we got different employees
		expect(reloadedEmployees).not.toBe(customTeam);
		expect(reloadedEmployees).toHaveLength(5); // Repository creates 5 employees per department
		for (const employee of reloadedEmployees) {
			expect(employee).toBeInstanceOf(Employee);
			expect(employee.departmentId).toBe(department.id);
		}
	});

	it("should load data by many keys", async () => {
		const handlerName = "LOAD_ORDERS_BY_CUSTOMER_IDS";

		class Order {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.commerce.productName())
			product: string;

			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			customerId: number;
		}

		class Customer {
			@FactoryField((faker) => faker.number.int({ max: 99999 }))
			id: number;

			@FactoryField((faker) => faker.person.fullName())
			name: string;

			@Load(() => [Order], {
				key: "id",
				parentKey: "customerId",
				handler: handlerName,
			})
			orders: Order[];
		}

		class OrderRepository {
			@DataloaderHandler(handlerName)
			static async loadByCustomerIds(customerIds: number[]) {
				return customerIds.flatMap((customerId) => {
					return factory.createList(Order, 3).override((orders) => {
						for (const order of orders) {
							order.customerId = customerId;
						}
						return orders;
					});
				});
			}
		}

		vi.spyOn(explorerService, "findMetadataHandlerByName").mockReturnValueOnce({
			repository: OrderRepository,
			provider: {
				provide: OrderRepository,
				field: "loadByCustomerIds",
			},
		});

		LazyMetadataContainer.loadRelationshipMetadata();

		const customers = factory.newList(Customer, 3);

		const results = await dataloaderService.loadMany({
			from: Customer,
			field: "orders",
			data: customers,
		});

		expect(results).toHaveLength(customers.length);

		for (const customer of customers) {
			const customerOrders = results.find((res) => res.some((order) => order.customerId === customer.id));
			expect(customerOrders).toHaveLength(3);
			for (const order of customerOrders) {
				expect(order.customerId).toBe(customer.id);
				expect(order).toBeInstanceOf(Order);
			}
		}
	});

	it.todo("should handle empty input keys gracefully without errors");
	it.todo("should return undefined for keys that do not resolve to any data");
	it.todo("should respect the cache settings from CacheMapService");
	it.todo("should throw an error if resolvePath fails to resolve the key");
	it.todo("should handle dataloader.batchFunction errors gracefully");
	it.todo("should support additional arguments passed during dataloader creation");
	it.todo("should ensure dataloaders are scoped correctly to requests");
	it.todo("should reuse dataloaders for identical metadata and args within a request");
	it.todo("should handle metadata for nested relationships correctly");
	it.todo("should support different batch sizes set via CacheMapService");
	it.todo("should respect custom caching mechanisms provided by CacheMapService");
	it.todo("should correctly map loaded data to parent entities using DataloaderMapper");
	it.todo("should throw an error when attempting to load unsupported relationships");
	it.todo("should correctly handle scenarios with no configured cacheMap");
});
