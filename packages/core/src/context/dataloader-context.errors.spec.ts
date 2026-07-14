import { DataloaderHandler } from "../decorators/dataloader-handler/dataloader-handler.decorator";
import { Load } from "../decorators/load/load.decorator";
import { LazyMetadataContainer } from "../utils";
import { DataloaderContext } from "./dataloader-context";
import { SimpleHandlerResolver } from "./simple-handler-resolver";

describe("DataloaderContext error handling", () => {
	let handlerResolver: SimpleHandlerResolver;
	let context: DataloaderContext;

	beforeEach(() => {
		LazyMetadataContainer.clear();
		handlerResolver = new SimpleHandlerResolver();
		context = new DataloaderContext({ handlerResolver });
	});

	it("should throw when the parent class has no relationship metadata", async () => {
		class Unknown {
			id: number;
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		await expect(context.load({ from: Unknown, field: "id", parent: { id: 1 } as Unknown })).rejects.toThrowError(
			"Cannot find metadata for Unknown",
		);
	});

	it("should throw when the field has no relationship metadata", async () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "SOME_HANDLER" })
			photos: Photo[];

			name: string;
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		await expect(context.load({ from: User, field: "name", parent: { id: 1 } as User })).rejects.toThrowError(
			"Cannot find metadata for field: name in User",
		);
	});

	it("should throw when the handler is not registered in the metadata container", async () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "MISSING_HANDLER" })
			photos: Photo[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		await expect(context.load({ from: User, field: "photos", parent: { id: 1 } as User })).rejects.toThrowError(
			"Cannot find handler: MISSING_HANDLER",
		);
	});

	it("should throw when clearing a dataloader that was never created", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "SOME_HANDLER" })
			photos: Photo[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		expect(() => context.clear({ from: User, field: "photos", parent: { id: 1 } as User })).toThrowError(
			"Cannot find dataloader for User",
		);
	});

	it("should resolve handlers through registered aliases", async () => {
		abstract class AbstractPhotoRepository {}

		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS" })
			photos: Photo[];
		}

		class ConcretePhotoRepository {
			@DataloaderHandler("LOAD_PHOTOS")
			async loadByUserIds(userIds: number[]) {
				return userIds.map((userId) => ({ id: userId * 10, userId }));
			}
		}

		// simulates @AliasFor(() => ConcretePhotoRepository) on an abstract handler class
		LazyMetadataContainer.dataloaderHandlers.get("LOAD_PHOTOS").provide = AbstractPhotoRepository as any;
		LazyMetadataContainer.addAliasMetadata(() => ConcretePhotoRepository as any, AbstractPhotoRepository as any);

		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadAliasMetadata();

		handlerResolver.register(new ConcretePhotoRepository(), ConcretePhotoRepository);

		const photos = await context.load({ from: User, field: "photos", parent: { id: 1 } as User });

		expect(photos).toEqual([{ id: 10, userId: 1 }]);
	});
});
