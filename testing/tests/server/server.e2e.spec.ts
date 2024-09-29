import { startTestEnvironment } from "testing/testing-environment/start-test-environment";
import { TestClientService } from "testing/testing-environment/test-client/test-client.service";
import { TestServerService } from "testing/testing-environment/test-server/test-server.service";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
