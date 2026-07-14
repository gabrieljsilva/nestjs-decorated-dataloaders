import { MapperFN, RelationType } from "../../types/dataloader.types";
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

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "LOAD_PHOTO_BY_USER_ID" })
			photo: Photo;
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations?.get("photo");
		expect(photoMetadata).toEqual({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_PHOTO_BY_USER_ID",
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

			@Load(() => [Photo], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BY_USER_ID" })
			photos: Photo[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photosMetadata = userRelations?.get("photos");
		expect(photosMetadata).toEqual({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_PHOTOS_BY_USER_ID",
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

			@Load(() => Photo, { key: "id", parentKey: "userId", handler: "LOAD_PHOTO_BY_USER_ID" })
			photo: Photo;

			@Load(() => [Album], { key: "id", parentKey: "userId", handler: "LOAD_ALBUMS_BY_USER_ID" })
			albums: Album[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const photoMetadata = userRelations?.get("photo");
		expect(photoMetadata).toEqual({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_PHOTO_BY_USER_ID",
			type: RelationType.OneToOne,
			parent: User,
			child: Photo,
		});

		const albumMetadata = userRelations?.get("albums");
		expect(albumMetadata).toEqual({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_ALBUMS_BY_USER_ID",
			type: RelationType.OneToMany,
			parent: User,
			child: Album,
		});
	});

	it("should handle nested relationships correctly", () => {
		class Comment {
			id: number;
			postId: number;
		}

		class Post {
			id: number;
			userId: number;

			@Load(() => [Comment], { key: "id", parentKey: "postId", handler: "LOAD_COMMENTS_BY_POST_ID" })
			comments: Comment[];
		}

		class User {
			id: number;

			@Load(() => [Post], { key: "id", parentKey: "userId", handler: "LOAD_POSTS_BY_USER_ID" })
			posts: Post[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		expect(userRelations).toBeDefined();

		const postMetadata = userRelations?.get("posts");
		expect(postMetadata).toEqual({
			key: "id",
			parentKey: "userId",
			handler: "LOAD_POSTS_BY_USER_ID",
			type: RelationType.OneToMany,
			parent: User,
			child: Post,
		});

		const postRelations = LazyMetadataContainer.loadedRelationships.get(Post);
		expect(postRelations).toBeDefined();

		const commentMetadata = postRelations?.get("comments");
		expect(commentMetadata).toEqual({
			key: "id",
			parentKey: "postId",
			handler: "LOAD_COMMENTS_BY_POST_ID",
			type: RelationType.OneToMany,
			parent: Post,
			child: Comment,
		});
	});

	it("should not add metadata for unrelated entities", () => {
		class Post {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Post, { key: "id", parentKey: "userId", handler: "LOAD_POSTS_BY_USER_ID" })
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

			@Load(() => Employee, { key: "id", parentKey: "managerId", handler: "LOAD_MANAGER_BY_EMPLOYEE_ID" })
			manager: Employee;

			@Load(() => [Employee], { key: "id", parentKey: "managerId", handler: "LOAD_EMPLOYEES_BY_MANAGER_ID" })
			employees: Employee[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const employeeRelations = LazyMetadataContainer.loadedRelationships.get(Employee);
		expect(employeeRelations).toBeDefined();

		const managerMetadata = employeeRelations?.get("manager");
		expect(managerMetadata).toEqual({
			key: "id",
			parentKey: "managerId",
			handler: "LOAD_MANAGER_BY_EMPLOYEE_ID",
			type: RelationType.OneToOne,
			parent: Employee,
			child: Employee,
		});

		const employeesMetadata = employeeRelations?.get("employees");
		expect(employeesMetadata).toEqual({
			key: "id",
			parentKey: "managerId",
			handler: "LOAD_EMPLOYEES_BY_MANAGER_ID",
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

			@Load(() => [Comment], { key: "id", parentKey: "postId", handler: "LOAD_COMMENTS_BY_POST_ID" })
			comments: Comment[];

			@Load(() => [Tag], { key: "id", parentKey: "postId", handler: "LOAD_TAGS_BY_POST_ID" })
			tags: Tag[];
		}

		class Profile {
			id: number;
			userId: number;
		}

		class User {
			id: number;

			@Load(() => Profile, { key: "id", parentKey: "userId", handler: "LOAD_PROFILE_BY_USER_ID" })
			profile: Profile;

			@Load(() => [Post], { key: "id", parentKey: "userId", handler: "LOAD_POSTS_BY_USER_ID" })
			posts: Post[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const userRelations = LazyMetadataContainer.loadedRelationships.get(User);
		const profileMetadata = userRelations?.get("profile");
		expect(profileMetadata).toEqual({
			parent: User,
			child: Profile,
			type: RelationType.OneToOne,
			handler: "LOAD_PROFILE_BY_USER_ID",
			key: "id",
			parentKey: "userId",
		});

		const postsMetadata = userRelations?.get("posts");
		expect(postsMetadata).toEqual({
			parent: User,
			child: Post,
			handler: "LOAD_POSTS_BY_USER_ID",
			key: "id",
			parentKey: "userId",
			type: RelationType.OneToMany,
		});

		const postRelations = LazyMetadataContainer.loadedRelationships.get(Post);
		const commentsMetadata = postRelations?.get("comments");
		expect(commentsMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Post,
			child: Comment,
			handler: "LOAD_COMMENTS_BY_POST_ID",
			key: "id",
			parentKey: "postId",
		});

		const tagsMetadata = postRelations?.get("tags");
		expect(tagsMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Post,
			child: Tag,
			handler: "LOAD_TAGS_BY_POST_ID",
			key: "id",
			parentKey: "postId",
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

		class Video extends BaseContent {}

		class Creator {
			id: number;

			@Load(() => [Article], { key: "id", parentKey: "creatorId", handler: "LOAD_ARTICLES_BY_CREATOR_ID" })
			articles: Article[];

			@Load(() => [Video], { key: "id", parentKey: "creatorId", handler: "LOAD_VIDEOS_BY_CREATOR_ID" })
			videos: Video[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const creatorRelations = LazyMetadataContainer.loadedRelationships.get(Creator);
		expect(creatorRelations).toBeDefined();

		const articlesMetadata = creatorRelations?.get("articles");
		expect(articlesMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Creator,
			child: Article,
			handler: "LOAD_ARTICLES_BY_CREATOR_ID",
			key: "id",
			parentKey: "creatorId",
		});

		const videosMetadata = creatorRelations?.get("videos");
		expect(videosMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Creator,
			child: Video,
			handler: "LOAD_VIDEOS_BY_CREATOR_ID",
			key: "id",
			parentKey: "creatorId",
		});
	});

	it("should handle relationships with composite keys", () => {
		class TeamMember {
			teamId: number;
			userId: number;
		}

		class Team {
			id: number;
			organizationId: number;

			@Load(() => [TeamMember], {
				key: "id",
				parentKey: "teamId",
				handler: "LOAD_TEAM_MEMBERS_BY_TEAM_ID",
			})
			members: TeamMember[];
		}

		class Organization {
			id: number;

			@Load(() => [Team], {
				key: "id",
				parentKey: "organizationId",
				handler: "LOAD_TEAMS_BY_ORGANIZATION_ID",
			})
			teams: Team[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const orgRelations = LazyMetadataContainer.loadedRelationships.get(Organization);
		const teamsMetadata = orgRelations.get("teams");
		expect(teamsMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Organization,
			child: Team,
			handler: "LOAD_TEAMS_BY_ORGANIZATION_ID",
			key: "id",
			parentKey: "organizationId",
		});

		const teamRelations = LazyMetadataContainer.loadedRelationships.get(Team);
		const membersMetadata = teamRelations?.get("members");
		expect(membersMetadata).toEqual({
			type: RelationType.OneToMany,
			parent: Team,
			child: TeamMember,
			handler: "LOAD_TEAM_MEMBERS_BY_TEAM_ID",
			key: "id",
			parentKey: "teamId",
		});
	});

	it("should handle function-based key and parentKey mappings", () => {
		class CompositeKeyEntity {
			id: number;
			type: string;
		}

		class Parent {
			id: number;
			type: string;

			@Load(() => [CompositeKeyEntity], {
				key: (parent) => `${parent.id}-${parent.type}`,
				parentKey: (child) => `${child.id}-${child.type}`,
				handler: "LOAD_ENTITIES_BY_COMPOSITE_KEY",
			})
			entities: CompositeKeyEntity[];
		}

		LazyMetadataContainer.loadRelationshipMetadata();

		const parentRelations = LazyMetadataContainer.loadedRelationships.get(Parent);
		const entitiesMetadata = parentRelations?.get("entities");

		expect(typeof entitiesMetadata.key).toBe("function");
		expect(typeof entitiesMetadata.parentKey).toBe("function");

		const parent = new Parent();
		parent.id = 1;
		parent.type = "test";

		const mapperFN = entitiesMetadata.key as MapperFN;

		expect(mapperFN(parent)).toBe("1-test");

		const child = new CompositeKeyEntity();
		child.id = 2;
		child.type = "child";

		const parentMapperFN = entitiesMetadata.key as MapperFN;
		expect(parentMapperFN(child)).toBe("2-child");
	});
});
