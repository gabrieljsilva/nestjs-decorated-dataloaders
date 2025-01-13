# Unit Testing Guidelines
This document serves as a detailed guide to ensure the creation of high-quality, consistent, and maintainable unit tests in this project. It aims to help developers write effective test cases that guarantee the stability, functionality, and integration of the system’s components.
## 🚀 **Purpose**
Unit testing ensures individual components (e.g., functions, classes, modules) work as intended in isolation. It also provides confidence in code changes and accelerates debugging processes, improving software maintainability.
This guide also addresses **integration tests**, which focus on verifying interactions between units or modules.
## 🔍 **Key Concepts**
1. **Unit Testing**:
    - Focuses on testing the smallest units of functionality in isolation (e.g., single functions, properties, or methods).

2. **Integration Testing**:
    - Verifies the proper interaction between multiple components or modules of the system.


> ⚠️ **Important**: Always prioritize targeted unit tests to pinpoint failures. Save integration tests for verifying interactions between isolated components.
>

## 📂 **File Structure**
- **Placement**: Test files should be located at the same directory level as the file being tested.
- **Naming Convention**: Name test files with the `.spec.ts` suffix.
  For example, for a file named `dataloader.service.ts`, create the test file as `dataloader.service.spec.ts`.


> 🛠️ **Best Practice**: Follow a clear and consistent structure to simplify test discovery and maintenance.
>

## 📦 **Required Libraries**
### Test Utilities
Ensure the following libraries are used in your tests for consistent mocking, data creation, and test execution:

| Library | Purpose |
| --- | --- |
| `decorated-factory` | Generate structured mock data using `faker`. |
| `suites` | Automock NestJS modules and services. |
| `vitest` | JavaScript test runner for executing test files. |
| `@nestjs/testing` | To test NestJS code using dependency injection support. |

> 📘 **Resources**:
> - [Decorated Factory Documentation]()
> - [Suites Documentation]()
>
>

## 🔧 **Setup Example**
The snippet below demonstrates how to structure and set up a basic unit test:
### **Testing Example: Service**
``` typescript
import { Factory } from "decorated-factory";
import { fakerPT_BR } from "@faker-js/faker";
import { Mocked } from "@suites/doubles.vitest";
import { TestBed } from "@suites/unit";
import { CreateUserUseCase } from "./create-user.use-case";

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;
  const factory = new Factory(fakerPT_BR);

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(CreateUserUseCase).compile();
    createUserUseCase = unit;
  });

  it("should be defined", () => {
    expect(createUserUseCase).toBeDefined();
  });

  // Additional meaningful tests here
});
```
### **Mocking Example: Entity**
``` typescript
import { Field, ObjectType } from "@nestjs/graphql";
import { FactoryField } from "decorated-factory";

@ObjectType()
export class UserEntity {
  @Field()
  @FactoryField((faker) => faker.number.int({ min: 1 }))
  id: number;

  @Field()
  @FactoryField((faker) => faker.person.firstName())
  name: string;

  @Field()
  @FactoryField((faker) => faker.internet.email())
  email: string;
}
```
> ⚠️ **Important Rules for Tests**:
> - No **nested `describe` blocks**: Avoid placing one `describe` block inside another.
> - Only **one top-level `describe` block** per file is allowed.
> - Remove unused variables and imports: They may slow down the execution of your test suite.
>
>

## 📖 **Best Practices for Writing Tests**
Effective testing follows a few simple rules to ensure readability, maintainability, and thorough validation:
### 📌 Test Isolation
- Ensure that each test case is **independent**. Shared states between test cases can lead to unreliable results.

### 📌 Reliable Data Mocks
- Use `decorated-factory` with `faker` to mock real-world, localized data.
  Example:
``` typescript
@FactoryField((faker) => faker.person.fullName())
name: string;

@FactoryField((faker) => faker.internet.email())
email: string;
```
- Mock services and modules using `@suites/unit` for effortless dependency injection in NestJS projects.

### 📌 Meaningful Assertions
- Include meaningful assertions that cover expected, edge, and failure cases.
  Example:
``` typescript
expect(result).toEqual(expectedValue);
expect(service.method).toHaveBeenCalledWith(requiredArguments);
```
### 📌 Structuring Tests:
Organize test files using the following pattern:
1. **Setup**:
    - Define your test environment: imports, mock data, modules, and services.

2. **Execution**:
    - Simulate the action under test.

3. **Assertion**:
    - Validate the correctness of outputs, state, and interactions.

Example:
``` typescript
describe("Testing Service A", () => {
  beforeEach(() => {
    // Setup your test
  });

  it("should perform X correctly", async () => {
    // Execution
    const result = await service.methodUnderTest();

    // Assertion
    expect(result).toBe(specificValue);
  });
});
```
## 📝 **Case Study: Loader Relationships**
When testing more complex logic such as relationship loading (e.g., one-to-many, one-to-one relationships):
### One-to-Many Example
``` typescript
class Photo {
  @FactoryField((faker) => faker.image.url())
  url: string;

  @FactoryField((faker) => faker.number.int())
  userId: number;
}

@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "custom-handler" })
photos: Photo[];
```
Test:
``` typescript
it("should load photos by user ID", async () => {
  const users = factory.newList(User, 3);
  const results = await Promise.all(
    users.map((user) => service.load({ from: User, field: "photos", data: user })),
  );

  expect(results.length).toBe(3);
  // Assert proper relationships
});
```
### One-to-One Example
``` typescript
@Load(() => Profile, { key: "id", parentKey: "userId", handler: "profile-handler" })
profile: Profile;
```
Test:
``` typescript
it("should load profile by user ID", async () => {
  const results = await Promise.all(
    users.map((user) => service.load({ from: User, field: "profile", data: user })),
  );

  // Assertions
  expect(results[0]?.userId).toBe(users[0].id);
});
```
## ✅ **Final Notes**
- Write clean, isolated, and maintainable tests.
- Use reliable data sources for mocks.
- Avoid relying on other test results.
- Name your tests descriptively to show what they validate.
