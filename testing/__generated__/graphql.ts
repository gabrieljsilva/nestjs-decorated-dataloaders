/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type GroupEntity = {
  __typename?: 'GroupEntity';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type PhotoEntity = {
  __typename?: 'PhotoEntity';
  id: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  user: UserEntity;
  userId: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  photos: Array<PhotoEntity>;
  users: Array<UserEntity>;
};

export type UserEntity = {
  __typename?: 'UserEntity';
  createdAt: Scalars['DateTime']['output'];
  groups: Array<GroupEntity>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  photos: Array<PhotoEntity>;
};

export type UsersWithPhotosQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersWithPhotosQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserEntity', id: number, name: string, createdAt: any, photos: Array<{ __typename?: 'PhotoEntity', id: number, url: string, userId: number }> }> };

export type UsersWithGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersWithGroupsQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserEntity', id: number, name: string, createdAt: any, groups: Array<{ __typename?: 'GroupEntity', id: number, name: string }> }> };

export type FindManyPhotosQueryVariables = Exact<{ [key: string]: never; }>;


export type FindManyPhotosQuery = { __typename?: 'Query', photos: Array<{ __typename?: 'PhotoEntity', id: number, url: string, userId: number, user: { __typename?: 'UserEntity', id: number, name: string, createdAt: any } }> };


export const UsersWithPhotosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersWithPhotos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]}}]} as unknown as DocumentNode<UsersWithPhotosQuery, UsersWithPhotosQueryVariables>;
export const UsersWithGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersWithGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UsersWithGroupsQuery, UsersWithGroupsQueryVariables>;
export const FindManyPhotosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindManyPhotos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<FindManyPhotosQuery, FindManyPhotosQueryVariables>;