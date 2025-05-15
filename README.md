# NestJS Decorated Dataloaders

A lightweight wrapper around Dataloader that lets you declare where to batch and cache instead of wiring it by hand.
Add a @Load decorator to any field, register a handler, and the N+1 query problem is gone.

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
        name: "MyAwesomeDataloader",
        cache: true,
        maxBatchSize: 100,
        getCacheMap: () => new LRUMap(100),
    }),
  ],
})
export class AppModule {}
```

- **`name`**: Names the dataloader for better tracking and debugging.
- **`cache`**: Enables caching.
- **`maxBatchSize`**: Limits the maximum number of batched requests.
- **`getCacheMap`**: Defines a custom cache implementation (e.g., LRU Cache).

---

## **Defining Entities**

### **PhotoEntity**

```typescript
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Load } from "nestjs-decorated-dataloaders";
import { UserEntity } from "./user.entity";

@ObjectType()
export class PhotoEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  url: string;

  @Field(() => Number)
  userId: number;
}
```

### **UserEntity**

```typescript
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Load } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

@ObjectType()
export class UserEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  createdAt: Date;

  // One-to-one relationship with PhotoEntity
  @Load(() => PhotoEntity, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photo: PhotoEntity;

  // One-to-many relationship with PhotoEntity
  @Load(() => [PhotoEntity], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photos: PhotoEntity[];
}
```

---

## **Dataloader Handlers**

Dataloader handlers define how data is fetched from the data source. Handlers are tied to specific dataloaders using the `@DataloaderHandler` decorator.

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "../../entities/photo.entity";
import { DatabaseService } from "../database/database.service";

// tip: define constants for handler keys in a separated file
export const LOAD_PHOTOS_BY_USER = "LOAD_PHOTOS_BY_USER";

@Injectable()
export class PhotoRepository {
  constructor(
    @Inject(DatabaseService)
    private readonly database: DatabaseService,
  ) {}
    
  /**
   * This method will be called by the dataloader with batched user IDs
   */
  @DataloaderHandler(LOAD_PHOTOS_BY_USER)
  async findAllByUsersIds(usersIds: number[]): Promise<PhotoEntity[]> {
    // Fetch all photos from some data source
    const photos = await this.database.getPhotos();

    // Filter photos by the batch of user IDs
    return photos.filter((photo) => usersIds.includes(photo.userId));
  }
}
```

---

## **Using Dataloaders in Resolvers**

Resolvers use the `DataloaderService` to load related entities, ensuring requests are batched and cached.

```typescript
import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "nestjs-decorated-dataloaders";
import { GroupEntity } from "../entities/group.entity";
import { PhotoEntity } from "../entities/photo.entity";
import { UserEntity } from "../entities/user.entity";

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(
    @Inject(DataloaderService)
    private readonly dataloaderService: DataloaderService,
  ) {}
    
  /**
   * This resolver field uses the dataloader to fetch photos for a user
   * The dataloader will batch and cache requests for optimal performance
   */
  @ResolveField(() => [PhotoEntity])
  async photos(@Parent() user: UserEntity) {
    return this.dataloaderService.load({ 
      from: UserEntity,
      field: "photos",
      data: user
    });
  }
}
```

---

## **Advanced Concepts**

### **Function-Based Mapper**

Function-Based Mapper allows you to use functions instead of string paths for the `key` and `parentKey` properties in the `@Load` decorator. This is particularly useful when you need to work with composite keys or when you need more complex mapping logic.

```typescript
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Load } from "nestjs-decorated-dataloaders";
import { CategoryPostEntity } from "./category-post.entity";
import { CategoryEntity } from "./category.entity";

@ObjectType()
export class PostEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  createdAt: string;

  // Relationship with CategoryPostEntity for the many-to-many relationship
  categoryPosts: CategoryPostEntity[];

  /**
   * Using Function-Based Mapper for complex relationships
   * This handles a many-to-many relationship through a join table
   */
  @Load(() => [CategoryEntity], {
    key: (category) => category.id,
    parentKey: (post) => post.categoryPosts.map((cp) => cp.postId),
    handler: "LOAD_CATEGORY_BY_POSTS",
  })
  categories: CategoryEntity[];
}
```

In this example, the `key` function extracts the `id` from the category entity, and the `parentKey` function maps through the `categoryPosts` array to extract all `postId` values.

#### **Benefits of Function-Based Mapper**

- **Complex Mapping**: You can implement complex mapping logic that goes beyond simple property access.
- **Composite Keys**: You can create composite keys by combining multiple fields.
- **Flexibility**: You can use any JavaScript expression to compute the key.
- **Performance**: Function-based mappers are more CPU efficient compared to string-based mappers.

### **Type Safety**

You can use TypeScript generics to ensure type safety when declaring a Dataloader field. 

```typescript
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Load } from "nestjs-decorated-dataloaders";
import { PhotoEntity } from "./photo.entity";

@ObjectType()
export class UserEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  createdAt: Date;
  
  @Load<PhotoEntity, UserEntity>(() => [PhotoEntity], {
    key: (user) => user.id,
    parentKey: (photo) => photo.userId,
    handler: "LOAD_PHOTOS_BY_USER",
  })
  photos: Array<PhotoEntity>;
}
```

In this example, the `key` function is typed to receive a `UserEntity` and the `parentKey` function is typed to receive a `PhotoEntity`.

### **Handling Circular Dependencies**
Circular dependencies between entities (e.g., User ↔ Photo) can cause metadata resolution errors when using reflect-metadata. For example:

reflect-metadata tries to read metadata from User, which references Photo.

Photo in turn references User, but if User hasn't been fully initialized, its metadata resolves to undefined.

This issue is common in environments using SWC. To resolve it, use the Relation<T> wrapper provided by nestjs-decorated-dataloaders.

Solution: Wrapping Circular References
Encapsulate circular properties with Relation<T>. This prevents reflect-metadata from attempting to resolve the circular dependency during type introspection.

Example:

```typescript

import { Relation } from 'nestjs-decorated-dataloaders';

class User {
  photo: Relation<Photo>;
}

class Photo {
  user: Relation<User>;
}
```
How It Works
Generic Type Erasure: reflect-metadata cannot infer generic types like Relation<Photo>, so it defaults the metadata to undefined, avoiding circular resolution errors.

Explicit Type Declaration: You must manually specify the wrapped type (e.g., Relation<Photo>) to retain type safety in your code.

 **Important Notes**
Use Relation<T> only for circular dependencies. For non-circular references, use direct types (e.g., Photo instead of Relation<Photo>).
Ensure the generic type (e.g., Photo inside Relation<Photo>) is explicitly declared to avoid type inference issues.

### **Aliases**

Aliases let you associate a dataloader handler with an abstract class, offering a simple way to handle cases where decorators can't be used, especially in complex architectures with shared or abstract classes.
#### **Using Aliases**

```typescript
@AliasFor(() => AbstractPhotoService)
export class ConcretePhotoService {}
```

This allows `PhotoService` to serve as the dataloader handler for `AbstractPhotoService`.

### **Under the Hood**

`nestjs-decorated-dataloaders` is built on top of the GraphQL Dataloader library. At its core, a dataloader is a mechanism for batching and caching database or API requests, reducing the number of round trips required to fetch related data.

- **Batching**: Dataloader batches multiple requests for the same resource into a single query. This ensures that, rather than issuing one query per entity (e.g., fetching one photo per user), the dataloader combines them into a single query that fetches all the photos for the users in one go.
- **Caching**: Dataloader caches query results, preventing redundant queries for the same data within the same request cycle. This ensures that once a resource is fetched, subsequent requests for the same resource will use the cached data.

#### **High-Level Nest.js Abstraction**

`nestjs-decorated-dataloaders` abstracts the complexities of manually managing dataloaders and integrates seamlessly with Nest.js using decorators. It provides a declarative and maintainable approach to solving the N+1 problem, allowing you to focus on building features without worrying about the underlying dataloader logic.

By using decorators like `@Load` and `@DataloaderHandler`, this module streamlines dataloader setup, making it simple to handle related entities in GraphQL resolvers without manual dataloader instantiation or dependency injection.

---
