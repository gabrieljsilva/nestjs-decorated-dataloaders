import { type DynamicModule, OnModuleInit } from "@nestjs/common";
import { LazyMetadataContainer } from "../../utils";
import { CacheMapService, CacheMapServiceOptions } from "../cache-map/cache-map.service";
import { DataloaderService } from "../dataloader-service/dataloader.service";
import { ExplorerService } from "../explorer-service/explorer.service";

type DataloaderModuleOptions = CacheMapServiceOptions;

export class DataloaderModule implements OnModuleInit {
	static forRoot(options: DataloaderModuleOptions = {}): DynamicModule {
		return {
			module: DataloaderModule,
			providers: [
				DataloaderService,
				ExplorerService,
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
