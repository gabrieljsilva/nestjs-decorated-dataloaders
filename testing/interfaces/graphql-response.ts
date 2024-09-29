import { Response } from "supertest";

export type GraphqlResponse<T> = Omit<Response, "body"> & { body: { data: T } };
