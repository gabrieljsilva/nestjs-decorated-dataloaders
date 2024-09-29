import "reflect-metadata";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { LRUMap } from "lru_map";
import { GroupModule } from "testing/app/modules/group/group-module";
import { DataloaderModule } from "../../src";
import { PhotoModule } from "./modules/photo/photo.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: false,
			autoSchemaFile: "./schema.gql",
		}),
		DataloaderModule.forRoot({
			cache: true,
			maxBatchSize: 100,
			getCacheMap: () => new LRUMap(100),
			name: "MyAwesomeDataloader",
		}),
		UserModule,
		PhotoModule,
		GroupModule,
	],
})
export class AppModule {}
