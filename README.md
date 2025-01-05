# NestJS Decorated Dataloaders

`nestjs-decorated-dataloaders` is a module designed to simplify the creation of GraphQL dataloaders using decorators, solving the N+1 problem in a declarative and scalable way.

---

## **The N+1 Problem**

The N+1 problem arises when fetching related data results in multiple database queries. For example, fetching photos for a list of users might execute one query for the users and N additional queries (one for each user) to fetch their photos. This causes unnecessary database overhead, degrading performance.

`nestjs-decorated-dataloaders` minimizes database queries by batching and caching data fetches, optimizing performance and scalability.

---

## **Installation**

### Using npm

```bash
npm install nestjs-decorated-dataloaders
```

### Using yarn

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

## **Using the ****************************************`@Load`**************************************** Decorator**

The `@Load` decorator is the recommended way to define relationships for dataloaders. It supports both one-to-one and one-to-many relationships in a concise, flexible manner.

### **One-to-One Example**

```typescript
import { Load } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;
  name: string;

  @Load(() => PhotoEntity, { key: "id", parentKey: "userId", handler: "photoLoader" })
  photo: PhotoEntity;
}
```

### **One-to-Many Example**

```typescript
import { Load } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;
  name: string;

  @Load(() => [PhotoEntity], { key: "id", parentKey: "userId", handler: "photoLoader" })
  photos: PhotoEntity[];
}
```

### **Parameters Explained**

- **`() => Entity`**: Specifies the related entity type (e.g., `PhotoEntity`). Use `() => [Entity]` for one-to-many relationships.
- **`key`**: The property in the parent entity used for matching (e.g., `id`).
- **`parentKey`**: The property in the related entity corresponding to the parent entity (e.g., `userId`).
- **`handler`**: The name of the dataloader handler defined in the service using `@DataloaderHandler`.

---

## **Dataloader Handlers**

Dataloader handlers define how data is fetched from the data source. Handlers are tied to specific dataloaders using the `@DataloaderHandler` decorator.

```typescript
import { DataloaderHandler } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

export class PhotoService {
  @DataloaderHandler("photoLoader")
  async loadPhotosByUserIds(userIds: number[]): Promise<PhotoEntity[]> {
    // Implement data fetching logic here
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
    return this.dataloaderService.load(PhotoEntity, { from: UserEntity, by: [user] });
  }

  @ResolveField(() => [PhotoEntity])
  async photos(@Parent() user: UserEntity) {
    return this.dataloaderService.load([PhotoEntity], { from: UserEntity, by: [user] });
  }
}
```

---

## **Query Example**

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

---

## **Deprecated Decorators**

### **`@LoadOne`** and **`@LoadMany`**

The `@LoadOne` and `@LoadMany` decorators are deprecated and will be removed in future releases. Use `@Load` instead.

#### \*\*One-to-One Example with \*\***`@LoadOne`**

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

#### One-to-Many Example with **`@LoadMany`**

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

With `nestjs-decorated-dataloaders`, solving the N+1 problem becomes straightforward, declarative, and efficient, ensuring optimal performance for your GraphQL applications.

