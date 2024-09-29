import { type DynamicModule } from "@nestjs/common";
import { DataloaderMetadataContainer } from "../utils/dataloader-metadata-container";
import { CacheMapService, CacheMapServiceOptions } from "./cache-map.service";
import { DataloaderMetadataService } from "./dataloader-metadata.service";
import { DataloaderService } from "./dataloader.service";

type DataloaderModuleOptions = CacheMapServiceOptions;

export class DataloaderModule {
	static forRoot(options: DataloaderModuleOptions = {}): DynamicModule {
		return {
			module: DataloaderModule,
			providers: [
				DataloaderService,
				{
					provide: DataloaderMetadataService,
					useFactory: async () => {
						/**
						 * Resolve relations of DataloaderMetadataContainer
						 * after all entities have been loaded and transformed it into an appropriate data structure (Graph)
						 */
						const relations = DataloaderMetadataContainer.resolveRelations();
						const aliases = DataloaderMetadataContainer.resolveAliases();
						const dataloaderHandlers = DataloaderMetadataContainer.getDataloaderHandlers();

						return new DataloaderMetadataService(relations, aliases, dataloaderHandlers);
					},
				},
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
}
