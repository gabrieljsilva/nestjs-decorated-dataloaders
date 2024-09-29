import { print } from "@apollo/client/utilities";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { Inject, Injectable } from "@nestjs/common";
import { DocumentNode } from "graphql/language";
import request from "supertest";
import { GraphqlResponse } from "../../interfaces";
import { TestServerService } from "../test-server/test-server.service";

interface QueryOptions<Output, Input> {
	query: string | DocumentNode | TypedDocumentNode<Output>;
	variables?: Input;
}

@Injectable()
export class TestClientService {
	constructor(
		@Inject(TestServerService)
		private readonly testServer: TestServerService,
	) {}

	async query<Output, Input = void>(options: QueryOptions<Output, Input>) {
		const { query, variables } = options;
		const response: GraphqlResponse<Output> = await request(this.testServer.app.getHttpServer())
			.post("/graphql")
			.send({ query: typeof query === "string" ? query : print(query), variables });
		return response.body;
	}
}
