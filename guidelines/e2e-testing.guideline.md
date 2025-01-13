# E2E Testing Guideline
This guide provides a comprehensive reference for creating, managing, and maintaining E2E (end-to-end) tests within this project. All examples, best practices, and structures included here are aimed at ensuring that E2E tests accurately verify the behavior of the application as a whole, simulating real-world user interactions.
## Overview
End-to-End (E2E) Tests ensure that the application's entire workflow functions properly. These tests simulate real user interactions and validate that the behavior and integration of various components in the application align with expectations.
E2E tests primarily focus on:
- Verifying multiple layers of the system, from frontend to backend and database.
- Detecting breaking changes when the application is integrated.

⚠️ **Note**: While E2E tests are critical, they tend to be slower and more resource-intensive compared to unit tests. Use them where integration testing is crucial.
## Test Setup and Environment
### Test Framework
The project uses **Vitest** as the testing framework. This gives a fast and efficient solution for writing and running tests in TypeScript.
### Initialization of the Test Environment
The test environment is configured with the `startTestEnvironment` function, which:
- Initializes a NestJS application.
- Provides the necessary services for testing:
    - **`TestClientService` **for executing GraphQL queries.
    - **`TestServerService` **for managing the server lifecycle.

Here is an example of how to prepare the environment:
``` typescript
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
### Lifecycle Hooks
- **`beforeAll` **: Sets up the test environment as shown in the above example.
- **`afterAll` **: Ensures that resources such as the server are properly shut down after tests.

## Writing GraphQL-Based Tests
This project leverages **Codegen** to generate TypeScript types for GraphQL responses. This ensures type safety and integration with TypeScript during development.
### Creating Queries and Mutations
- Always use the `gql` function (found in the `__generated__` directory) when building GraphQL queries. This ensures Codegen compatibility.
- Activate IDE IntelliSense for your GraphQL strings by adding the comment `/* GraphQL */` before your template literal.

#### Example GraphQL Query Test
The following demonstrates how to list users along with their mapped photos:
``` typescript
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
    // Add assertions based on the expected response
});
```
⚠️ **Important**: Codegen depends on the `schema.gql` file generated each time the tests are run. Ensure that the schema is always up-to-date before execution.
## Structuring Test Suites and Test Cases
Well-structured and organized test cases enhance readability and maintainability.
### Organization Rules
- Use `describe` to group tests logically.
- Every `describe` should only contain tests (`it` functions) that are directly correlated or related.
- Keep test cases **realistic** by replicating how actual components and services behave in production.
- Avoid hardcoding test data; leverage utilities like **factory classes**.

📂 **Test Location**: Create all E2E tests in the `/testing/tests` directory.
#### Example Test Design
``` typescript
describe("User Module", () => {
    it("should fetch user data with associated photos", async () => {
        const query = gql(/* GraphQL */ `
            query FetchUserWithPhotos {
                users {
                    id
                    name
                    photos {
                        id
                        url
                    }
                }
            }
        `);

        const result = await client.query({ query });
        expect(result.data.users).toBeDefined();
    });
});
```
## Avoiding Duplication: Routines
Routines streamline repeatable pieces of code, reducing duplication across your test cases.
### Creating a Routine
A **routine** is packaged as a NestJS injectible class, which can then be imported and reused.
Steps:
1. Create a new routine (e.g. `example.routine.ts`).
2. Register the routine in a parent module (`routines.module.ts`).
3. Expose the routine via a service (`routines.service.ts`).

#### Routine Example:
`example.routine.ts`:
``` typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExampleRoutine {
    async execute() {
        // Logic shared across multiple test cases
    }
}
```
`routines.module.ts`:
``` typescript
import { Module } from "@nestjs/common";
import { ExampleRoutine } from "./example.routine";

@Module({
    providers: [ExampleRoutine],
    exports: [ExampleRoutine],
})
export class RoutinesModule {}
```

`routines.service.ts`:
``` typescript
import { Inject, Injectable } from "@nestjs/common";
import { ExampleRoutine } from "./routines/example.routine.ts";

@Injectable()
export class RoutinesService {
    constructor(@Inject(ExampleRoutine) public readonly exampleRoutine: ExampleRoutine) {}
}

```

## Comprehensive Example: Querying Relational Data
Below is an example inspired by `loader.e2e.spec.ts`, demonstrating how to query entities with their related data and validate the response.
### Listing Posts with Comments
``` typescript
import { gql } from "../../__generated__";

it("should list posts with mapped comments", async () => {
    const query = gql(/* GraphQL */ `
        query PostsWithComments {
            posts {
                id
                title
                createdAt
                comments {
                    id
                    text
                    postId
                }
            }
        }
    `);

    const response = await client.query({ query });

    // Validation
    for (const post of response.data.posts) {
        expect(post).toMatchObject({
            id: expect.anything(),
            title: expect.any(String),
            createdAt: expect.any(String),
            comments: expect.any(Array),
        });

        for (const comment of post.comments) {
            expect(comment).toMatchObject({
                id: expect.anything(),
                text: expect.any(String),
                postId: post.id,
            });
        }
    }
});
```
## Best Practices Summary
- **Type Safety**: Always use GraphQL Codegen with the `gql` template literal for seamless TypeScript integration.
- **Structured Files**: Group related tests into well-defined `describe` blocks for better readability.
- **Realistic Examples**: Mimic production structures and flows.
- **Factories**: Use utility **factories** to avoid redundant mock data creation.
- **Reusable Code**: Rely on **routines** to streamline repetitive tasks.

Following these guidelines ensures that your E2E tests remain maintainable, efficient, and reliable.
