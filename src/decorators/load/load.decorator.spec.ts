import { RelationType } from "../../types/dataloader.types";
import { LazyMetadataContainer } from "../../utils";
import { Load } from "./load.decorator";

describe("Load Decorator", () => {
	beforeEach(() => {
		LazyMetadataContainer.clear();
	});

	it("should add valid one-to-one relationship metadata to LazyMetadataContainer", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_IDS" })
			photo: Photo;
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations?.get("photo");
		expect(photoMetadata).toMatchObject({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_PHOTOS_BY_USER_IDS",
			type: RelationType.OneToOne,
			parent: User,
			child: Photo,
		});
	});

	it("should add valid one-to-many relationship metadata to LazyMetadataContainer", () => {
		class Photo {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "photoLoader" })
			photos: Photo[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photosMetadata = userRelations?.get("photos");
		expect(photosMetadata).toMatchObject({
			key: "id",
			parentKey: "userId",
			handler: "photoLoader",
			type: RelationType.OneToMany,
			parent: User,
			child: Photo,
		});
	});

	it("should handle multiple relationships on the same entity", () => {
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

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "photoLoader" })
			photo: Photo;

			@Load(() => [Album], { key: "id", parentKey: "userId", handler: "albumLoader" })
			albums: Album[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations?.get("photo");
		expect(photoMetadata).toMatchObject({
			key: "id",
			parentKey: "userId",
			handler: "photoLoader",
			type: RelationType.OneToOne,
			parent: User,
			child: Photo,
		});

		const albumMetadata = userRelations?.get("albums");
		expect(albumMetadata).toMatchObject({
			key: "id",
			parentKey: "userId",
			handler: "albumLoader",
			type: RelationType.OneToMany,
			parent: User,
			child: Album,
		});
	});

	it("should handle nested relationships correctly", () => {
		class GrandPhoto {
			id: number;
			photoId: number;
		}

		class Photo {
			id: number;
			userId: number;

			@Load(() => [GrandPhoto], { key: "id", parentKey: "photoId", handler: "grandPhotoLoader" })
			grandPhotos: GrandPhoto[];
		}

		class User {
			id: number;

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "photoLoader" })
			photos: Photo[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations?.get("photos");
		expect(photoMetadata).toMatchObject({
			key: "id",
			parentKey: "userId",
			handler: "photoLoader",
			type: RelationType.OneToMany,
			parent: User,
			child: Photo,
		});

		const photoRelations = LazyMetadataContainer.loadedRelationships.get(Photo);
		expect(photoRelations).toBeDefined();

		const grandPhotoMetadata = photoRelations?.get("grandPhotos");
		expect(grandPhotoMetadata).toMatchObject({
			key: "id",
			parentKey: "photoId",
			handler: "grandPhotoLoader",
			type: RelationType.OneToMany,
			parent: Photo,
			child: GrandPhoto,
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

			@Load(() => Post, { key: "id", parentKey: "userId", handler: "postLoader" })
			posts: Post[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const commentMetadata = userRelations?.get("comment");
		expect(commentMetadata).toBeUndefined();
	});

	it("should handle circular dependencies correctly", () => {
		class Employee {
			id: number;
			managerId: number;

			@Load(() => Employee, { key: "id", parentKey: "managerId", handler: "managerLoader" })
			manager: Employee;

			@Load(() => [Employee], { key: "id", parentKey: "managerId", handler: "employeesLoader" })
			employees: Employee[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const employeeRelations = LazyMetadataContainer.loadedRelationships.get(Employee);
		expect(employeeRelations).toBeDefined();

		const managerMetadata = employeeRelations?.get("manager");
		expect(managerMetadata).toMatchObject({
			key: "id",
			parentKey: "managerId",
			handler: "managerLoader",
			type: RelationType.OneToOne,
			parent: Employee,
			child: Employee,
		});

		const employeesMetadata = employeeRelations?.get("employees");
		expect(employeesMetadata).toMatchObject({
			key: "id",
			parentKey: "managerId",
			handler: "employeesLoader",
			type: RelationType.OneToMany,
			parent: Employee,
			child: Employee,
		});
	});

	it("should handle deeply nested relationships with multiple paths", () => {
		class Comment {
			id: number;
			postId: number;
		}

		class Tag {
			id: number;
			postId: number;
		}

		class Post {
			id: number;
			userId: number;

			@Load(() => [Comment], { key: "id", parentKey: "postId", handler: "commentLoader" })
			comments: Comment[];

			@Load(() => [Tag], { key: "id", parentKey: "postId", handler: "tagLoader" })
			tags: Tag[];
		}

		class Profile {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Profile, { key: "id", parentKey: "userId", handler: "profileLoader" })
			profile: Profile;

			@Load(() => [Post], { key: "id", parentKey: "userId", handler: "postLoader" })
			posts: Post[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		const profileMetadata = userRelations?.get("profile");
		expect(profileMetadata).toMatchObject({
			type: RelationType.OneToOne,
			parent: User,
			child: Profile,
		});

		const postsMetadata = userRelations?.get("posts");
		expect(postsMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: User,
			child: Post,
		});

		const postRelations = LazyMetadataContainer.loadedRelationships.get(Post);
		const commentsMetadata = postRelations?.get("comments");
		expect(commentsMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Post,
			child: Comment,
		});

		const tagsMetadata = postRelations?.get("tags");
		expect(tagsMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Post,
			child: Tag,
		});
	});

	it("should handle inheritance in entity relationships", () => {
		class BaseContent {
			id: number;
			creatorId: number;
		}

		class Article extends BaseContent {
			title: string;
		}

		class Video extends BaseContent {
			duration: number;
		}

		class Creator {
			id: number;

			@Load(() => [Article], { key: "id", parentKey: "creatorId", handler: "articleLoader" })
			articles: Article[];

			@Load(() => [Video], { key: "id", parentKey: "creatorId", handler: "videoLoader" })
			videos: Video[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const creatorRelations = LazyMetadataContainer.loadedRelationships.get(Creator);
		expect(creatorRelations).toBeDefined();

		const articlesMetadata = creatorRelations?.get("articles");
		expect(articlesMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Creator,
			child: Article,
		});

		const videosMetadata = creatorRelations?.get("videos");
		expect(videosMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Creator,
			child: Video,
		});
	});

	it("should handle relationships with composite keys", () => {
		class TeamMember {
			teamId: number;
			userId: number;
			role: string;
		}

		class Team {
			id: number;
			organizationId: number;

			@Load(() => [TeamMember], {
				key: "id",
				parentKey: "teamId",
				handler: "teamMemberLoader",
			})
			members: TeamMember[];
		}

		class Organization {
			id: number;

			@Load(() => [Team], {
				key: "id",
				parentKey: "organizationId",
				handler: "teamLoader",
			})
			teams: Team[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const orgRelations = LazyMetadataContainer.loadedRelationships.get(Organization);
		const teamsMetadata = orgRelations?.get("teams");
		expect(teamsMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Organization,
			child: Team,
		});

		const teamRelations = LazyMetadataContainer.loadedRelationships.get(Team);
		const membersMetadata = teamRelations?.get("members");
		expect(membersMetadata).toMatchObject({
			type: RelationType.OneToMany,
			parent: Team,
			child: TeamMember,
		});
	});
});
