import "reflect-metadata";
import { gql } from "testing/__generated__";
import { TestClientService } from "testing/testing-environment/test-client/test-client.service";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestEnvironment } from "../../testing-environment/start-test-environment";
import { TestServerService } from "../../testing-environment/test-server/test-server.service";

describe("one-to-many", () => {
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

	it("should list photos with mapped user", async () => {
		const query = gql(/* GraphQL */ `
			query FindManyPhotos {
				photos {
					id
					url
					userId
					user {
						id
						name
						createdAt
					}
				}
			}
		`);

		const response = await client.query({ query });

		for (const photo of response.data.photos) {
			expect(photo).toEqual({
				id: expect.any(Number),
				url: expect.any(String),
				userId: expect.any(Number),
				user: expect.any(Object),
			});

			expect(photo.user).toEqual({
				id: expect.any(Number),
				name: expect.any(String),
				createdAt: expect.any(String),
			});
		}
	});
});
