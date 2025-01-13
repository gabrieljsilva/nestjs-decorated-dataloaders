# NestJS Decorated Dataloaders

`nestjs-decorated-dataloaders` is a module designed to simplify the creation of GraphQL dataloaders using decorators, solving the N+1 problem in a declarative and scalable way.


This module minimizes database queries by batching and caching data fetches, optimizing performance and scalability.

---

## **Installation**

```bash
npm install nestjs-decorated-dataloaders
```

or using yarn:

```bash
yarn add nestjs-decorated-dataloaders
```

---

## **Quick Start**

### **Module Configuration**

Configure the `DataloaderModule` in your application module:

```typescript
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { LRUMap } from "lru_map";
import { DataloaderModule } from "nestjs-decorated-dataloaders";

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    DataloaderModule.forRoot({
      cache: true,
      maxBatchSize: 100,
      getCacheMap: () => new LRUMap(100),
      name: "MyAwesomeDataloader",
    }),
  ],
})
export class AppModule {}
```

- **`cache`**: Enables caching.
- **`maxBatchSize`**: Limits the maximum number of batched requests.
- **`getCacheMap`**: Defines a custom cache implementation (e.g., LRU Cache).
- **`name`**: Names the dataloader for better tracking and debugging.

---

## **Defining Entities**

### **PhotoEntity**

```typescript
export class PhotoEntity {
  id: number;
  url: string;
  userId: number;
}
```

### **UserEntity**

```typescript
import { Load } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;
  name: string;

  @Load(() => PhotoEntity, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photo: PhotoEntity;

  @Load(() => [PhotoEntity], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photos: PhotoEntity[];
}
```

---

## **Dataloader Handlers**

Dataloader handlers define how data is fetched from the data source. Handlers are tied to specific dataloaders using the `@DataloaderHandler` decorator.

```typescript
import { DataloaderHandler } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

export class PhotoService {
  @DataloaderHandler("LOAD_PHOTOS_BY_USER_ID")
  async loadPhotosByUserIds(userIds: number[]): Promise<PhotoEntity[]> {
    // Replace with actual data fetching logic
  }
}
```

---

## **Using Dataloaders in Resolvers**

Resolvers use the `DataloaderService` to load related entities, ensuring requests are batched and cached.

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
    return this.dataloaderService.load({ from: UserEntity, field: "photo", data: user });
  }

  @ResolveField(() => [PhotoEntity])
  async photos(@Parent() user: UserEntity) {
    return this.dataloaderService.load({ from: UserEntity, field: "photos", data: user });
  }
}
```

---

## **Advanced Concepts**

### **Aliases**

Aliases allow you to link a dataloader handler to an abstract class, which is especially useful when working with more complex architectures that include abstract or shared classes.

> #### **Why Use Aliases?**
> Sometimes you may want to map a dataloader handler to an abstract class that doesn't allow decorators. Aliases provide a way to assign a handler to such cases.

#### **Using Aliases**

```typescript
@AliasFor(() => AbstractPhotoService)
export class ConcretePhotoService {}
```

This allows `PhotoService` to serve as the dataloader handler for `AbstractPhotoService`.

#### **Under the Hood**

`nestjs-decorated-dataloaders` is built on top of the GraphQL Dataloader library. At its core, a dataloader is a mechanism for batching and caching database or API requests, reducing the number of round trips required to fetch related data.

- **Batching**: Dataloader batches multiple requests for the same resource into a single query. This ensures that, rather than issuing one query per entity (e.g., fetching one photo per user), the dataloader combines them into a single query that fetches all the photos for the users in one go.
- **Caching**: Dataloader caches query results, preventing redundant queries for the same data within the same request cycle. This ensures that once a resource is fetched, subsequent requests for the same resource will use the cached data.

#### **High-Level Nest.js Abstraction**

`nestjs-decorated-dataloaders` abstracts the complexities of manually managing dataloaders and integrates seamlessly with Nest.js using decorators. It provides a declarative and maintainable approach to solving the N+1 problem, allowing you to focus on building features without worrying about the underlying dataloader logic.

By using decorators like `@Load` and `@DataloaderHandler`, this module streamlines dataloader setup, making it simple to handle related entities in GraphQL resolvers without manual dataloader instantiation or dependency injection.

---

## **Migration Guide**

### **Migrating from ****************`@LoadOne`**************** and ****************`@LoadMany`**************** Decorators**

Replace the old `@LoadOne` and `@LoadMany` decorators with the new `@Load` decorator. Ensure the options are correctly mapped to the new syntax.

#### **Old Code**

```typescript
import { LoadOne } from "nestjs-decorated-dataloaders";

export class UserEntity {
  id: number;

  @LoadOne(() => PhotoEntity, { by: "id", where: "userId", on: "photoLoader" })
  photo: PhotoEntity;
}
```

#### **New Code**

```typescript
import { Load } from "nestjs-decorated-dataloaders";

export class UserEntity {
  id: number;

  @Load(() => PhotoEntity, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photo: PhotoEntity;
}
```

### **Migrating DataloaderService Syntax**

Update the `dataloaderService.load` syntax to use the new parameters.

#### **Old Code**

```typescript
this.dataloaderService.load(PhotoEntity, { from: UserEntity, by: [user] });
```

#### **New Code**

```typescript
this.dataloaderService.load({ from: UserEntity, field: "photo", data: user });
```

---

