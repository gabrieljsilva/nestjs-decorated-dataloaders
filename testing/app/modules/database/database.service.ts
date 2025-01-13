import { fakerPT_BR } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { CategoryPostEntity } from "../category-post/category-post.entity";
import { CategoryEntity } from "../category/category.entity";
import { GroupEntity } from "../group/group.entity";
import { PostEntity } from "../post/post.entity";
import { UserGroupEntity } from "../user-group/user-group.entity";
import { UserEntity } from "../user/user.entity";

@Injectable()
export class DatabaseService {
	public data = this.generateData();
	private generateData() {
		const factory = new Factory(fakerPT_BR);

		const posts = factory
			.createList(PostEntity, 3, {
				comments: [3],
			})
			.override((posts) => {
				for (const post of posts) {
					for (const comment of post.comments) {
						comment.postId = post.id;
					}
				}

				return posts;
			});

		const comments = posts.flatMap((post) => post.comments);

		for (const post of posts) {
			post.comments = undefined;
		}

		const users = factory
			.createList(UserEntity, 5, {
				photos: [2],
			})
			.override((users) => {
				for (const user of users) {
					for (const photo of user.photos) {
						photo.userId = user.id;
					}
				}
				return users;
			});

		const photos = users.flatMap((user) => user.photos);

		for (const user of users) {
			user.photos = undefined;
		}

		const groups = factory.newList(GroupEntity, 5);

		const userGroups = users.flatMap((user) => {
			return groups.map((group) => {
				const userGroup = new UserGroupEntity();
				userGroup.userId = user.id;
				userGroup.groupId = group.id;
				return userGroup;
			});
		});

		for (const group of groups) {
			group.userGroups = userGroups.filter((userGroup) => userGroup.groupId === group.id);
		}

		const categories = factory.newList(CategoryEntity, 5);

		const categoryPosts: Array<CategoryPostEntity> = [];

		for (const post of posts) {
			for (const category of categories) {
				const categoryPost = factory.new(CategoryPostEntity);
				categoryPost.categoryId = category.id;
				categoryPost.postId = post.id;
				categoryPosts.push(categoryPost);
			}
		}

		return {
			posts,
			comments,
			users,
			photos,
			groups,
			categories,
			categoryPosts,
		};
	}

	public getCategories() {
		return this.data.categories;
	}

	public getPosts() {
		return this.data.posts;
	}

	public getComments() {
		return this.data.comments;
	}

	public getUsers() {
		return this.data.users;
	}

	public getPhotos() {
		return this.data.photos;
	}

	public getGroups() {
		return this.data.groups;
	}

	public getCategoryPosts() {
		return this.data.categoryPosts;
	}
}
