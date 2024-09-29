import "reflect-metadata";
import { afterAll, beforeAll, bench, describe, expect, it } from "vitest";
import { gql } from "../../__generated__";
import { startTestEnvironment } from "../../testing-environment/start-test-environment";
import { TestClientService } from "../../testing-environment/test-client/test-client.service";
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

	it("should list user with mapped groups by intermediate entity", async () => {
		const query = gql(/* GraphQL */ `
			query UsersWithGroups {
				users {
					id
					name
					createdAt
					groups {
						id
						name
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
				groups: expect.any(Array),
			});

			expect(user.groups.length > 0).toBeTruthy();

			for (const group of user.groups) {
				expect(group).toEqual({
					id: expect.any(Number),
					name: expect.any(String),
				});
			}
		}
	});
});
