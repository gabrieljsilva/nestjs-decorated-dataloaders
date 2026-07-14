import { LazyMetadataContainer } from "@decorated-dataloaders/core";
import { type DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { CacheMapService, CacheMapServiceOptions } from "../cache-map";
import { DataloaderService } from "../dataloader-service";
import { NestHandlerResolver } from "../handler-resolver";

type DataloaderModuleOptions = CacheMapServiceOptions;

@Module({})
export class DataloaderModule implements OnModuleInit {
	static forRoot(options: DataloaderModuleOptions = {}): DynamicModule {
		return {
			module: DataloaderModule,
			providers: [
				DataloaderService,
				NestHandlerResolver,
				{
					provide: CacheMapService,
					useValue: new CacheMapService(options),
				},
			],
			exports: [DataloaderService],
			global: true,
			imports: [],
		};
	}

	async onModuleInit() {
		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadAliasMetadata();
	}
}
