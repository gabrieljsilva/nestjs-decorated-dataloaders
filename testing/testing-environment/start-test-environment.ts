import { NestFactory } from "@nestjs/core";
import { RoutinesService } from "./routines/routines.service";
import { TestClientService } from "./test-client/test-client.service";
import { TestServerService } from "./test-server/test-server.service";
import { TestingEnvironmentModule } from "./testing-environment.module";

/**
 * Starts the testing environment using Nest.js DI container.
 * "Server" is the test Graphql application;
 * "Client" is an abstraction over Supertest library optimized for querying Graphql applications;
 * "Routines" is a service that provides common use cases for testing.
 *
 *  PS: You can use DI container to use a variety of services in
 *  your E2E tests like TestContainers, Databases and external APIs;
 */

export async function startTestEnvironment() {
	const container = await NestFactory.createApplicationContext(TestingEnvironmentModule);

	const server = container.get(TestServerService);
	const client = container.get(TestClientService);
	const routines = container.get(RoutinesService);

	return {
		client,
		server,
		routines,
	};
}
