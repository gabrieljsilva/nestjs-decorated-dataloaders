import { dataloaderMetadata } from "../constants";
import { RelationType } from "../types/dataloader.types";
import { Load } from "./load.decorator";

describe("Load Decorator", () => {
	beforeEach(() => {
		dataloaderMetadata.start();
	});

	it("should add valid one-to-one relation metadata to the dataloader metadata container", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_IDS" })
			photo: Photo;
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations.get(Photo);
		expect(photoMetadata).toBeDefined();

		const photoFieldMetadata = photoMetadata.get("photo");
		expect(photoFieldMetadata).toBeDefined();

		expect(photoFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "LOAD_PHOTOS_BY_USER_IDS",
			type: RelationType.OneToOne,
			field: "photo",
		});
	});

	it("should add valid one-to-many relation metadata to the dataloader metadata container", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "photoLoader" })
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
		class Photo {
			id: number;
			userId: number;
		}

		class Album {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_IDS" })
			photo: Photo;

			@Load(() => Album, { key: "id", parentKey: "userId", handler: "LOAD_ALBUMS_BY_USER_IDS" })
			album: Album;
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations.get(Photo);
		expect(photoMetadata).toBeDefined();
		const photoFieldMetadata = photoMetadata.get("photo");
		expect(photoFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "LOAD_PHOTOS_BY_USER_IDS",
			type: RelationType.OneToOne,
			field: "photo",
		});

		const albumMetadata = userRelations.get(Album);
		expect(albumMetadata).toBeDefined();
		const albumFieldMetadata = albumMetadata.get("album");
		expect(albumFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "LOAD_ALBUMS_BY_USER_IDS",
			type: RelationType.OneToOne,
			field: "album",
		});
	});

	it("should correctly handle complex relation configurations", () => {
		class Profile {
			id: number;
			userId: number;
		}

		class Settings {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Profile, { key: "id", parentKey: "userId", handler: "LOAD_PROFILES_BY_USER_IDS" })
			profile: Profile;

			@Load(() => Settings, { key: "id", parentKey: "userId", handler: "LOAD_SETTINGS_BY_USER_IDS" })
			settings: Settings;
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const profileMetadata = userRelations.get(Profile);
		expect(profileMetadata).toBeDefined();
		const profileFieldMetadata = profileMetadata.get("profile");
		expect(profileFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "LOAD_PROFILES_BY_USER_IDS",
			type: RelationType.OneToOne,
			field: "profile",
		});

		const settingsMetadata = userRelations.get(Settings);
		expect(settingsMetadata).toBeDefined();
		const settingsFieldMetadata = settingsMetadata.get("settings");
		expect(settingsFieldMetadata).toMatchObject({
			by: "id",
			where: "userId",
			on: "LOAD_SETTINGS_BY_USER_IDS",
			type: RelationType.OneToOne,
			field: "settings",
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

			@Load(() => Post, { key: "id", parentKey: "userId", handler: "LOAD_POSTS_BY_USER_IDS" })
			post: Post;
		}

		const metadata = dataloaderMetadata.resolveRelations();

		const userRelations = metadata.getEdges(User);
		expect(userRelations).toBeDefined();

		const commentMetadata = userRelations.get(Comment);
		expect(commentMetadata).toBeUndefined();
	});
});
