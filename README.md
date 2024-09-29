# Nestjs Decorated Dataloaders

A Nest.js module designed to simplify the creation of GraphQL dataloaders using decorators, solving the N+1 problem with ease and elegance.

## The N+1 Problem

The N+1 problem occurs when an application needs to load related data for a set of entities. For example, if you need to load photos for each user in a list of users, you might issue one query to fetch the users and then N additional queries (one for each user) to fetch their photos. This results in unnecessary database overhead, slowing down performance.

`nestjs-decorated-dataloaders` solves this issue by batching and caching these requests, minimizing the number of database queries and optimizing performance.

---

## Installation

### Using npm

```bash
npm install nestjs-decorated-dataloaders
```

### Using yarn

```bash
yarn add nestjs-decorated-dataloaders
```

---

## Quick Start

### Module Configuration

To start using `nestjs-decorated-dataloaders`, you first need to configure the `DataloaderModule` in your NestJS application module.

```typescript
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { LRUMap } from "lru_map";
import { DataloaderModule } from "nestjs-decorated-dataloaders";
import { UserModule } from "./modules/user/user.module";
import { PhotoModule } from "./modules/photo/photo.module";
import { GroupModule } from "./modules/group/group.module";

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    DataloaderModule.register({
        global: true,
        dataloaderOptions: {
            cache: true,
            name: 'MyAwesomeDataloader',
            getCacheMap: () => new LRUMap(100),
            maxBatchSize: 100,
        },
    }),
    UserModule,
    PhotoModule,
    GroupModule,
  ],
})
export class AppModule {}
```

In this configuration:
- `global: true` ensures that the dataloader service is available throughout the application.
- `cache`: Determines if the dataloader should cache results.
- `maxBatchSize`: Controls the maximum number of requests batched together.
- `getCacheMap`: Allows for a custom cache implementation (e.g., LRU Cache).
- `name`: The name of the dataloader, used by tracking services.

### Relations Setup with Decorators

#### One-to-One Relations

For a one-to-one relationship, use the `@LoadOne` decorator to automatically batch and cache requests.

```typescript
import { LoadOne } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;
  name: string;
  
  @LoadOne(() => PhotoEntity, { by: "id", where: "userId", on: "photoLoader" })
  photo: PhotoEntity;
}
```

- **`() => PhotoEntity`**: This defines the type of the related entity being loaded. In this case, it's the `PhotoEntity`. The `()=>` syntax is used to lazily resolve the entity, avoiding circular dependencies in TypeScript.

- **`by: "id"`**: This indicates the property in the `UserEntity` that is used to match the related data. Here, it specifies that the `id` property of the `UserEntity` will be used to find the corresponding `PhotoEntity`.

- **`where: "userId"`**: This specifies the property in the `PhotoEntity` that corresponds to the user. It is used to filter the photos by the `userId` field in the `PhotoEntity`, ensuring that only photos associated with the specific user are fetched.

- **`on: "photoLoader"`**: This is the name given to the dataloader handler defined in the service using `@DataloaderHandler("photoLoader")`. It indicates which dataloader will be used to fetch the records, ensuring efficient batch loading.

This configuration allows the decorator to automatically load the related `PhotoEntity` based on the `UserEntity`'s `id`, using the specified dataloader to retrieve the corresponding photos.
#### One-to-Many Relations

For a one-to-many relationship, use the `@LoadMany` decorator to efficiently handle multiple related entities.

```typescript
import { LoadMany } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;
  name: string;

  @LoadMany(() => PhotoEntity, { by: "id", where: "userId", on: "photoLoader" })
  photos: PhotoEntity[];
}
```

---

## Dataloader Handler

Handlers define how data is fetched from your data source. They should be tied to a specific dataloader via the `@DataloaderHandler` decorator.

```typescript
import { DataloaderHandler } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

export class PhotoService {
  @DataloaderHandler("photoLoader")
  async loadPhotosByUserIds(userIds: number[]): Promise<PhotoEntity[]> {
    // Implement data loading logic here (e.g., fetch photos by user IDs)
  }
}
```

This handler batches requests for photos by `userIds` and returns them to the dataloader.

---

## Using Dataloader in GraphQL Resolvers

Resolvers leverage the `DataloaderService` to load related entities, ensuring that requests are batched and cached.

```typescript
import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { DataloaderService } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";
import { PhotoEntity } from "./photo.entity";

@Resolver(UserEntity)
export class UserResolver {
  constructor(private readonly dataloaderService: DataloaderService) {}

  @ResolveField(() => PhotoEntity)
  async photo(@Parent() user: UserEntity) {
    return this.dataloaderService.load(PhotoEntity, { from: UserEntity, by: [user] });
  }

  @ResolveField(() => [PhotoEntity])
  async photos(@Parent() user: UserEntity) {
    return this.dataloaderService.load(PhotoEntity, { from: UserEntity, by: [user] });
  }
}
```

---

## Querying Data

With dataloaders configured, you can perform optimized queries through GraphQL.

```graphql
query UsersWithPhotos {
  users {
    id
    name
    photo {
      id
      url
    }
    photos {
      id
      url
    }
  }
}
```

This query will automatically batch and optimize requests for photos using the configured dataloaders, minimizing database hits.

---

## Advanced Concepts

### Aliases

Aliases allow you to link a dataloader handler to an abstract class or interface, which is especially useful when working with more complex architectures that include abstract or shared classes.

#### Why Use Aliases?

Sometimes you may want to map a dataloader handler to an abstract class or interface that doesn't allow decorators. Aliases provide a way to assign a handler to such cases.

#### Using Aliases

```typescript
import { AliasFor } from "nestjs-decorated-dataloaders";
import { PhotoService } from "./photo.service";

@AliasFor(() => PhotoService)
export class AbstractPhotoService {}
```

This allows `PhotoService` to serve as the dataloader handler for `AbstractPhotoService`.

---

## Under the Hood

`nestjs-decorated-dataloaders` is built on top of the [GraphQL Dataloader](https://github.com/graphql/dataloader) library. At its core, a dataloader is a mechanism for batching and caching database or API requests, reducing the number of round trips required to fetch related data.

### Batching

Dataloader batches multiple requests for the same resource into a single query. This ensures that, rather than issuing one query per entity (e.g., fetching one photo per user), the dataloader combines them into a single query that fetches all the photos for the users in one go.

### Caching

Dataloader caches query results, preventing redundant queries for the same data within the same request cycle. This ensures that once a resource is fetched, subsequent requests for the same resource will use the cached data.

### High-Level Nest.js Abstraction

`nestjs-decorated-dataloaders` abstracts the complexities of manually managing dataloaders and integrates seamlessly with Nest.js using decorators. It provides a declarative and maintainable approach to solving the N+1 problem, allowing you to focus on building features without worrying about the underlying dataloader logic.

By using decorators like `@LoadOne`, `@LoadMany`, and `@DataloaderHandler`, this module streamlines dataloader setup, making it simple to handle related entities in GraphQL resolvers without manual dataloader instantiation or dependency injection.

---

With `nestjs-decorated-dataloaders`, you can quickly and efficiently resolve the N+1 problem in your Nest.js GraphQL applications by leveraging dataloaders in a declarative, modular, and scalable manner.