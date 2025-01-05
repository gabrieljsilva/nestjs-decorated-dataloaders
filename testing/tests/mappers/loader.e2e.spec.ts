import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gql } from "../../__generated__";
import { startTestEnvironment } from "../../testing-environment/start-test-environment";
import { TestClientService } from "../../testing-environment/test-client/test-client.service";
import { TestServerService } from "../../testing-environment/test-server/test-server.service";

describe("loader", () => {
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

	it("should list posts with mapped comments", async () => {
		const query = gql(/* GraphQL */ `
			query PostsWithComments {
				posts {
					id
					title
					content
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

		for (const post of response.data.posts) {
			expect(post).toEqual({
				id: expect.any(Number),
				title: expect.any(String),
				content: expect.any(String),
				createdAt: expect.any(String),
				comments: expect.any(Array),
			});

			expect(post.comments.length > 0).toBeTruthy();

			for (const comment of post.comments) {
				expect(comment).toEqual({
					id: expect.any(Number),
					text: expect.any(String),
					postId: post.id,
				});
			}
		}
	});

	it("should list comments with mapped post", async () => {
		const query = gql(/* GraphQL */ `
			query CommentsWithPosts {
				comments {
					id
					text
					postId
					post {
						id
						title
						content
		                createdAt
					}
				}
			}
		`);

		const response = await client.query({ query });

		for (const comment of response.data.comments) {
			expect(comment).toEqual({
				id: expect.any(Number),
				text: expect.any(String),
				postId: expect.any(Number),
				post: {
					id: expect.any(Number),
					title: expect.any(String),
					content: expect.any(String),
					createdAt: expect.any(String),
				},
			});
		}
	});

	it("should list posts with mapped categories", async () => {
		const query = gql(/* GraphQL */ `
			query PostsWithCategories {
				posts {
					id
					title
					content
	                createdAt
					categories {
						id
						name
					}
				}
			}
		`);

		const response = await client.query({ query });

		for (const post of response.data.posts) {
			expect(post).toEqual({
				id: expect.any(Number),
				title: expect.any(String),
				content: expect.any(String),
				createdAt: expect.any(String),
				categories: expect.any(Array),
			});

			for (const category of post.categories) {
				expect(category).toEqual({
					id: expect.any(Number),
					name: expect.any(String),
				});
			}
		}
	});
});
