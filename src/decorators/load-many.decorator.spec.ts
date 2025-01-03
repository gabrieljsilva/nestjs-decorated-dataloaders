import { dataloaderMetadata } from "../constants";
import { RelationType } from "../types/dataloader.types";
import { LoadMany } from "./load-many.decorator";

describe("LoadMany Decorator", () => {
	beforeEach(() => {
		dataloaderMetadata.start();
	});

	it("should add valid one-to-many relation metadata to the dataloader metadata container", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@LoadMany(() => Photo, { by: "id", where: "userId", on: "photoLoader" })
			photos: Photo[];
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations.get(Photo);
		expect(photoMetadata).toBeDefined();

		const photosFieldMetadata = photoMetadata.get("photos");
		expect(photosFieldMetadata).toBeDefined();

		expect(photosFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "photoLoader",
			type: RelationType.OneToMany,
			field: "photos",
		});
	});

	it("should handle multiple relations on the same entity correctly", () => {
		class FirstPhoto {
			id: number;
			userId: number;
		}

		class SecondPhoto {
			id: number;
			user2Id: number;
		}

		class User {
			id: number;

			@LoadMany(() => FirstPhoto, { by: "id", where: "userId", on: "firstPhotoLoader" })
			firstPhotos: FirstPhoto[];

			@LoadMany(() => SecondPhoto, { by: "id", where: "user2Id", on: "secondPhotoLoader" })
			secondPhotos: SecondPhoto[];
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const firstPhotoMetadata = userRelations.get(FirstPhoto);
		expect(firstPhotoMetadata).toBeDefined();

		const firstPhotosFieldMetadata = firstPhotoMetadata.get("firstPhotos");
		expect(firstPhotosFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "firstPhotoLoader",
			type: RelationType.OneToMany,
			field: "firstPhotos",
		});

		const secondPhotoMetadata = userRelations.get(SecondPhoto);
		expect(secondPhotoMetadata).toBeDefined();

		const secondPhotosFieldMetadata = secondPhotoMetadata.get("secondPhotos");
		expect(secondPhotosFieldMetadata).toMatchObject({
			by: "id",
			where: "user2Id",
			on: "secondPhotoLoader",
			type: RelationType.OneToMany,
			field: "secondPhotos",
		});
	});

	it("should correctly handle complex relation configurations", () => {
		class GrandPhoto {
			id: number;
			photoId: number;
		}

		class FirstPhoto {
			id: number;
			userId: number;

			@LoadMany(() => GrandPhoto, { by: "id", where: "photoId", on: "grandPhotoLoader" })
			grandPhotos: GrandPhoto[];
		}

		class SecondPhoto {
			id: number;
			user2Id: number;
		}

		class User {
			id: number;

			@LoadMany(() => FirstPhoto, { by: "id", where: "userId", on: "firstPhotoLoader" })
			firstPhotos: FirstPhoto[];

			@LoadMany(() => SecondPhoto, { by: "id", where: "user2Id", on: "secondPhotoLoader" })
			secondPhotos: SecondPhoto[];
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const firstPhotoMetadata = userRelations.get(FirstPhoto);
		expect(firstPhotoMetadata).toBeDefined();

		const firstPhotosFieldMetadata = firstPhotoMetadata.get("firstPhotos");
		expect(firstPhotosFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "firstPhotoLoader",
			type: RelationType.OneToMany,
			field: "firstPhotos",
		});

		const secondPhotoMetadata = userRelations.get(SecondPhoto);
		expect(secondPhotoMetadata).toBeDefined();

		const secondPhotosFieldMetadata = secondPhotoMetadata.get("secondPhotos");
		expect(secondPhotosFieldMetadata).toMatchObject({
			by: "id",
			where: "user2Id",
			on: "secondPhotoLoader",
			type: RelationType.OneToMany,
			field: "secondPhotos",
		});

		const firstPhotoRelations = metadata.getEdges(FirstPhoto);
		expect(firstPhotoRelations).toBeDefined();

		const grandPhotoMetadata = firstPhotoRelations.get(GrandPhoto);
		expect(grandPhotoMetadata).toBeDefined();

		const grandPhotosFieldMetadata = grandPhotoMetadata.get("grandPhotos");
		expect(grandPhotosFieldMetadata).toMatchObject({
			by: "id",
			where: "photoId",
			on: "grandPhotoLoader",
			type: RelationType.OneToMany,
			field: "grandPhotos",
		});
	});

	it("should not add metadata for unrelated entities", () => {
		class Comment {
			id: number;
			postId: number;
		}

		class Post {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@LoadMany(() => Post, { by: "id", where: "userId", on: "postLoader" })
			posts: Post[];
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const commentMetadata = userRelations.get(Comment);
		expect(commentMetadata).toBeUndefined();
	});
});
