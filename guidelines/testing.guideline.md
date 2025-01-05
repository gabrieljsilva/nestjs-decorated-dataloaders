# Testing Guidelines

## E2E

### Overview
End-to-end (E2E) tests verify the entire application flow, ensuring that all components work together correctly. These tests simulate real user interactions and validate the application's behavior from the user's perspective.

### Setup
-   **Test Runner:** We use `vitest` as the test runner.
-   **Test Environment:**
    -   The `startTestEnvironment` function is used to set up the test environment. This function initializes a NestJS application and provides a `TestClientService` for making GraphQL queries and a `TestServerService` for managing the test server.
    -   The `beforeAll` hook is used to set up the test environment before running the tests.
    -   The `afterAll` hook is used to close the test server after all tests have completed.

    ```typescript
    import { startTestEnvironment } from "../../testing-environment/start-test-environment";
    import { TestClientService } from "../../testing-environment/test-client/test-client.service";
    import { TestServerService } from "../../testing-environment/test-server/test-server.service";

    describe("server", () => {
        let client: TestClientService;
        let server: TestServerService;

        beforeAll(async () => {
            const testEnvironment = await startTestEnvironment();

            client = testEnvironment.client;
            server = testEnvironment.server;
        });

        afterAll(async () => {
            await server.app.close();
        });

        it("should be defined", () => {
            expect(client).toBeDefined();
            expect(server).toBeDefined();
        });
    });
    ```

### GraphQL Queries
-   The `gql` template literal is used to define GraphQL queries.
-   The `TestClientService` is used to execute these queries against the test server.

    ```typescript
    import { gql } from "../../__generated__";

    it("should list users with mapped photos", async () => {
        const query = gql(/* GraphQL */ `
            query UsersWithPhotos {
                users {
                    id
                    name
                    createdAt
                    photos {
                        id
                        url
                        userId
                    }
                }
            }
        `);

        const response = await client.query({ query });
    });
    ```

### Assertions
-   `expect` is used to assert the results of the queries.
-   The tests check for the presence of data and the correct structure of the response.
-   `expect.any(Number)`, `expect.any(String)`, and `expect.any(Array)` are used to check the types of the data.
-   Specific values are checked to ensure the data is correct.

    ```typescript
    it("should list users with mapped photos", async () => {
        const query = gql(/* GraphQL */ `
            query UsersWithPhotos {
                users {
                    id
                    name
                    createdAt
                    photos {
                        id
                        url
                        userId
                    }
                }
            }
        `);

        const response = await client.query({ query });

        for (const user of response.data.users) {
            expect(user).toEqual({
                id: expect.any(Number),
                name: expect.any(String),
                createdAt: expect.any(String),
                photos: expect.any(Array),
            });

            expect(user.photos.length > 0).toBeTruthy();

            for (const photo of user.photos) {
                expect(photo).toEqual({
                    id: expect.any(Number),
                    url: expect.any(String),
                    userId: user.id,
                });
            }
        }
    });
    ```

### Test Structure
-   Tests are grouped using the `describe` function.
-   Each test case is defined using the `it` function.

### Routines
A routine is a piece of code that can be executed several times within the same test or across different tests. Routines help to avoid code duplication and make tests more maintainable.

To create a routine:
- Create a NestJS injectable class.
- Import the routine in `routines.module.ts`.
- Expose the routine in `routines.service.ts`.

Example:

```typescript
// testing/routines/routines/example.routine.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleRoutine {
  async run() {
    // Routine logic here
  }
}

// testing/testing-environment/routines/routines.module.ts
import { Module } from '@nestjs/common';
import { ExampleRoutine } from './example.routine';
import { RoutinesService } from './routines.service';

@Module({
  providers: [ExampleRoutine, RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}

// testing/testing-environment/routines/routines.service.ts
import { Injectable } from '@nestjs/common';
import { ExampleRoutine } from './example.routine';

@Injectable()
export class RoutinesService {
  constructor(private readonly exampleRoutine: ExampleRoutine) {}
}
```

## Unit/Integration

### Overview
Unit tests focus on testing individual units of code, such as functions, classes, or modules, in isolation. Integration tests verify the interaction between different units or modules.

### File Structure
- Unit tests should be created in the same level as the file that you are testing.
- The test file should end with `.spec.ts`.

### Libraries
- Should use the `decorated-factory` package to generate mock data with faker.
- Should use the `suites` package (prev. automock) to automock nest.js modules and services.
- Should use `vitest`.
- Should use `@nestjs/testing` package.

### Example
```typescript
import { Factory } from 'decorated-factory';
import { fakerPT_BR } from '@faker-js/faker';
import { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { CreateUserDto } from 'testing/app/modules/user/dto/create-user.dto';
import { UserEntity } from 'testing/app/modules/user/user.entity';
import { CreateUserUseCase } from 'testing/app/modules/user/use-cases/create-user.use-case';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  const factory = new Factory(fakerPT_BR);

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(CreateUserUseCase).compile();
    createUserUseCase = unit;
  });

  it('should be defined', () => {
    expect(createUserUseCase).toBeDefined();
  });

  it('should create a new user', async () => {
    const dto = factory.new(CreateUserDto);
    const user = factory.new(UserEntity);

    // Mock the repository call inside the use case
    const mockCreate = vi.fn().mockResolvedValue(user);
    (createUserUseCase as any).repositoryService.user.create = mockCreate;

    const result = await createUserUseCase.execute(dto);

    expect(result).toBe(user);
    expect(mockCreate).toHaveBeenCalledWith(dto);
  });
});
```

```typescript
import { Field, ObjectType } from '@nestjs/graphql';
import { FactoryField } from 'decorated-factory';

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

> IMPORTANT: Each file test should have only "describe" declaration
> IMPORTANT: Each file test should not have nested "describe". Should not have describe inside another describe
> IMPORTANT: Check for unused variables and unused imports to not affect the performance of the tests execution