/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n\t\t\tquery UsersWithPhotos {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tphotos {\n\t\t\t\t\t\tid\n\t\t\t\t\t\turl\n\t\t\t\t\t\tuserId\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t": types.UsersWithPhotosDocument,
    "\n\t\t\tquery UsersWithGroups {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tgroups {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t": types.UsersWithGroupsDocument,
    "\n\t\t\tquery FindManyPhotos {\n\t\t\t\tphotos {\n\t\t\t\t\tid\n\t\t\t\t\turl\n\t\t\t\t\tuserId\n\t\t\t\t\tuser {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t\tcreatedAt\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t": types.FindManyPhotosDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\t\t\tquery UsersWithPhotos {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tphotos {\n\t\t\t\t\t\tid\n\t\t\t\t\t\turl\n\t\t\t\t\t\tuserId\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"): (typeof documents)["\n\t\t\tquery UsersWithPhotos {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tphotos {\n\t\t\t\t\t\tid\n\t\t\t\t\t\turl\n\t\t\t\t\t\tuserId\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\t\t\tquery UsersWithGroups {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tgroups {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"): (typeof documents)["\n\t\t\tquery UsersWithGroups {\n\t\t\t\tusers {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t\tcreatedAt\n\t\t\t\t\tgroups {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\t\t\tquery FindManyPhotos {\n\t\t\t\tphotos {\n\t\t\t\t\tid\n\t\t\t\t\turl\n\t\t\t\t\tuserId\n\t\t\t\t\tuser {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t\tcreatedAt\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"): (typeof documents)["\n\t\t\tquery FindManyPhotos {\n\t\t\t\tphotos {\n\t\t\t\t\tid\n\t\t\t\t\turl\n\t\t\t\t\tuserId\n\t\t\t\t\tuser {\n\t\t\t\t\t\tid\n\t\t\t\t\t\tname\n\t\t\t\t\t\tcreatedAt\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;