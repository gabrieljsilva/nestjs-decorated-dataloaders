import { DataloaderHandler, LazyMetadataContainer, Load, SimpleHandlerResolver } from "@decorated-dataloaders/core";
import { CacheMapService } from "../cache-map";
import { DataloaderService } from "./dataloader.service";

describe("DataloaderService", () => {
	beforeEach(() => {
		LazyMetadataContainer.clear();
	});

	let setupCount = 0;

	function setup() {
		// unique per call: the metadata container rejects duplicated handler keys
		const handlerName = `LOAD_PHOTOS_BY_USER_ID_${++setupCount}`;

		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], {
				key: "id",
				parentKey: "userId",
				handler: handlerName,
			})
			photos: Photo[];
		}

		const calls: number[][] = [];

		class PhotoRepository {
			@DataloaderHandler(handlerName)
			async loadByUserIds(userIds: number[]) {
				calls.push(userIds);
				return userIds.map((userId) => ({ id: userId * 10, userId }));
			}
		}

		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadAliasMetadata();

		const handlerResolver = new SimpleHandlerResolver().register(new PhotoRepository());
		const service = new DataloaderService(handlerResolver as any, new CacheMapService());

		return { service, User, calls };
	}

	it("should batch loads through the underlying DataloaderContext", async () => {
		const { service, User, calls } = setup();

		const users = [{ id: 1 }, { id: 2 }, { id: 3 }];
		const results = await Promise.all(
			users.map((user) => service.load({ from: User, field: "photos", parent: user as any })),
		);

		expect(calls).toEqual([[1, 2, 3]]);
		expect(results).toHaveLength(3);
	});

	it("should cache loads for the same parent within the same instance", async () => {
		const { service, User, calls } = setup();

		const user = { id: 1 };
		const first = await service.load({ from: User, field: "photos", parent: user as any });
		const second = await service.load({ from: User, field: "photos", parent: user as any });

		expect(calls).toEqual([[1]]);
		expect(second).toBe(first);
	});

	it("should not share cache between service instances", async () => {
		const { service, User, calls } = setup();
		const otherSetup = setup();

		const user = { id: 1 };
		await service.load({ from: User, field: "photos", parent: user as any });
		await otherSetup.service.load({ from: otherSetup.User, field: "photos", parent: user as any });

		expect(calls.length + otherSetup.calls.length).toBe(2);
	});
});
