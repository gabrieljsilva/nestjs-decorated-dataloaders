# Decorated Dataloaders

A lightweight wrapper around Dataloader that lets you declare where to batch and cache instead of wiring it by hand.
Add an @Load decorator to any field, register a handler, and the N+1 query problem is gone.

This is a monorepo with two packages:

| Package | Description |
|---------|-------------|
| [`@decorated-dataloaders/core`](packages/core) | Framework-agnostic core: decorators, metadata, batching and caching. |
| [`@decorated-dataloaders/nestjs`](packages/nestjs) | NestJS adapter: `DataloaderModule`, request-scoped `DataloaderService`, DI-based handler resolution. |

> `nestjs-decorated-dataloaders` (the previous single package) is superseded by `@decorated-dataloaders/nestjs`. See the [migration guide](#migrating-from-nestjs-decorated-dataloaders).

---

## **Installation**

Using NestJS:

```bash
npm install @decorated-dataloaders/nestjs
```

Without a framework:

```bash
npm install @decorated-dataloaders/core
```

---

## **Quick Start (NestJS)**

### **Module Configuration**

Configure the `DataloaderModule` in your application module:

```typescript
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { LRUMap } from "lru_map";
import { DataloaderModule } from "@decorated-dataloaders/nestjs";

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
import { Load } from "@decorated-dataloaders/nestjs";
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
  @Load<PhotoEntity, UserEntity>(() => PhotoEntity, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photo: PhotoEntity;

  // One-to-many relationship with PhotoEntity
  @Load<PhotoEntity, UserEntity>(() => [PhotoEntity], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photos: PhotoEntity[];

  // Many-to-many relationship with PhotoEntity

  userPhotos: UserPhotoEntity[]; // intermediate table

  @Load<PhotoEntity, UserEntity>(() => [PhotoEntity], { key: "id", parentKey: "userPhotos.userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photosByUsers: PhotoEntity[];
}
```

---

## **Dataloader Handlers**

Dataloader handlers define how data is fetched from the data source. Handlers are tied to specific dataloaders using the `@DataloaderHandler` decorator.

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { DataloaderHandler } from "@decorated-dataloaders/nestjs";
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
    const photos = await this.database.getPhotos({
        where: {
            userId: { in: usersIds }
        }
    });

    return photos
  }
}
```

---

## **Using Dataloaders in Resolvers**

Resolvers use the `DataloaderService` to load related entities, ensuring requests are batched and cached.

```typescript
import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { DataloaderService } from "@decorated-dataloaders/nestjs";
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
      parent: user
    });
  }
}
```

---

## **Using the Core Without a Framework**

`@decorated-dataloaders/core` works standalone. Register your handler instances in a `SimpleHandlerResolver` and create one `DataloaderContext` per loading scope (typically one per request):

```typescript
import {
  DataloaderContext,
  DataloaderHandler,
  LazyMetadataContainer,
  Load,
  SimpleHandlerResolver,
} from "@decorated-dataloaders/core";

class Photo {
  id: number;
  userId: number;
}

class User {
  id: number;

  @Load(() => [Photo], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
  photos: Photo[];
}

class PhotoRepository {
  @DataloaderHandler("LOAD_PHOTOS_BY_USER_ID")
  async loadByUserIds(userIds: number[]): Promise<Photo[]> {
    return database.getPhotosByUserIds(userIds);
  }
}

// once, at application startup:
LazyMetadataContainer.loadRelationshipMetadata();
LazyMetadataContainer.loadAliasMetadata();

const handlerResolver = new SimpleHandlerResolver().register(new PhotoRepository());

// once per request:
const context = new DataloaderContext({ handlerResolver, cache: true });
const photos = await context.load({ from: User, field: "photos", parent: user });
```

---

## **Advanced Concepts**

### **Function-Based Mapper**

Function-Based Mapper allows you to use functions instead of string paths for the `key` and `parentKey` properties in the `@Load` decorator. This is particularly useful when you need to work with composite keys or when you need more complex mapping logic.

```typescript
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Load } from "@decorated-dataloaders/nestjs";
import { CategoryPostEntity } from "./category-post.entity";
import { CategoryEntity } from "./category.entity";

@ObjectType()
export class PostEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  // Relationship with CategoryPostEntity for the many-to-many relationship
  categoryPosts: CategoryPostEntity[];

  /**
   * Using Function-Based Mapper for complex relationships
   * This handles a many-to-many relationship through a join table
   */
  @Load<CategoryEntity, PostEntity>(() => [CategoryEntity], {
    key: (post) => post.categoryPosts.map((cp) => cp.postId),
    parentKey: (category) => category.id,
    handler: "LOAD_CATEGORY_BY_POSTS",
  })
  categories: CategoryEntity[];
}
```

In this example, the `key` function extracts the `postId` values from the `categoryPosts` array, and the `parentKey` function maps through the `categoryPosts` array to extract all `id` values.

#### **Benefits of Function-Based Mapper**

- **Complex Mapping**: You can implement complex mapping logic that goes beyond simple property access.
- **Composite Keys**: You can create composite keys by combining multiple fields.
- **Flexibility**: You can use any JavaScript expression to compute the key.
- **Performance**: Function-based mappers are more CPU efficient compared to string-based mappers.

### **Type Safety**

You can use TypeScript generics to ensure type safety when declaring a Dataloader field.

```typescript
import { Load } from "@decorated-dataloaders/nestjs";
import { PhotoEntity } from "./photo.entity";

export class UserEntity {
  id: number;

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

This issue is common in environments using SWC. To resolve it, use the `Relation<T>` wrapper.

Solution: Wrapping Circular References
Encapsulate circular properties with `Relation<T>`. This prevents reflect-metadata from attempting to resolve the circular dependency during type introspection.

Example:

```typescript
import { Relation } from "@decorated-dataloaders/nestjs";

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

This allows `ConcretePhotoService` to serve as the dataloader handler for `AbstractPhotoService`.

### **Error Handling**

Every error thrown by the library is a specific class extending `DecoratedDataloadersError`, with a stable `code` and a structured `payload` — no more matching on message strings. Use the `isDecoratedDataloadersError` type guard to tell library errors apart from your own:

```typescript
import { isDecoratedDataloadersError, HandlerNotFoundError } from "@decorated-dataloaders/nestjs";

try {
  await dataloaderService.load({ from: UserEntity, field: "photos", parent: user });
} catch (error) {
  if (isDecoratedDataloadersError(error)) {
    console.error(error.code, error.payload); // e.g. "HANDLER_NOT_FOUND", { handler: "LOAD_PHOTOS_BY_USER" }
  }
  throw error;
}
```

| Error | Code | Thrown when |
|-------|------|-------------|
| `ParentMetadataNotFoundError` | `PARENT_METADATA_NOT_FOUND` | `from` class has no `@Load` metadata |
| `FieldMetadataNotFoundError` | `FIELD_METADATA_NOT_FOUND` | the field has no `@Load` metadata |
| `HandlerNotFoundError` | `HANDLER_NOT_FOUND` | no `@DataloaderHandler` registered with that key |
| `HandlerProviderNotFoundError` | `HANDLER_PROVIDER_NOT_FOUND` | the handler class instance can't be resolved (DI or manual registration) |
| `DataloaderNotFoundError` | `DATALOADER_NOT_FOUND` | `clear`/`clearAll` called before any load for the field |
| `DuplicatedDataloaderHandlerError` | `DUPLICATED_DATALOADER_HANDLER` | two `@DataloaderHandler` share the same key |
| `InvalidBatchResultError` | `INVALID_BATCH_RESULT` | a handler returns something that isn't an array |

The guard works even when two copies of the package end up in `node_modules` (where `instanceof` breaks), via a shared `Symbol.for` marker.

### **Under the Hood**

`@decorated-dataloaders/core` is built on top of the GraphQL Dataloader library. At its core, a dataloader is a mechanism for batching and caching database or API requests, reducing the number of round trips required to fetch related data.

- **Batching**: Dataloader batches multiple requests for the same resource into a single query. This ensures that, rather than issuing one query per entity (e.g., fetching one photo per user), the dataloader combines them into a single query that fetches all the photos for the users in one go.
- **Caching**: Dataloader caches query results, preventing redundant queries for the same data within the same request cycle. This ensures that once a resource is fetched, later requests for the same resource will use the cached data.

The core has no dependency on NestJS: batching state lives in a `DataloaderContext`, and handler instances are located through a `HandlerResolver`. The NestJS adapter wraps the context in a request-scoped `DataloaderService` and resolves handlers through the DI container.

---

## **Migrating from nestjs-decorated-dataloaders**

1. Replace the package:

```bash
npm uninstall nestjs-decorated-dataloaders
npm install @decorated-dataloaders/nestjs
```

2. Update imports: `nestjs-decorated-dataloaders` → `@decorated-dataloaders/nestjs`. All previous exports (`DataloaderModule`, `DataloaderService`, `Load`, `DataloaderHandler`, `AliasFor`, `Relation`) are available.

3. Rename the `data` property to `parent` in `load`, `loadMany`, `prime`, `clear` and `clearAll` calls:

```diff
 return this.dataloaderService.load({
   from: UserEntity,
   field: "photos",
-  data: user,
+  parent: user,
 });
```

Everything else (decorators, module options, handlers, aliases) is unchanged.

---

## **Development**

This repository uses npm workspaces + [Turbo](https://turbo.build) for builds and [Changesets](https://github.com/changesets/changesets) for versioning and publishing (fixed versions across packages).

```bash
npm install        # install all workspaces
npm run build      # build all packages
npm test           # run unit and integration tests
npm run changeset  # record a change for release
npm run release    # version + build + publish
```
