import { fakerPT_BR } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Factory } from "decorated-factory";
import { CategoryPostEntity } from "../../entities/category-post.entity";
import { UserGroupEntity } from "../../entities/user-group.entity";

@Injectable()
export class DatabaseService {
	public data = this.generateData();
	private generateData() {
		const factory = new Factory(fakerPT_BR);

		/* CATEGORY, POST AND COMMENTS */
		const categoryPosts = factory.newList(CategoryPostEntity, 3, {
			category: true,
			post: {
				comments: [3],
			},
		});

		const categories = categoryPosts.flatMap((categoryPost) => categoryPost.category);
		const comments = categoryPosts.flatMap((categoryPost) => categoryPost.post.comments);
		const posts = categoryPosts.flatMap((categoryPost) => categoryPost.post);
		for (const categoryPost of categoryPosts) {
			delete categoryPost.category;
			delete categoryPost.post.comments;
			delete categoryPost.post;
		}

		/* USER, PHOTOS AND GROUPS */
		const userGroups = factory.newList(UserGroupEntity, 5, {
			group: true,
			user: {
				photos: [2],
			},
		});

		const groups = userGroups.flatMap((userGroup) => userGroup.group);
		const users = userGroups.flatMap((userGroup) => userGroup.user);
		const photos = users.flatMap((user) => user.photos);

		for (const userGroup of userGroups) {
			delete userGroup.group;
			delete userGroup.user.photos;
			delete userGroup.user;
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
