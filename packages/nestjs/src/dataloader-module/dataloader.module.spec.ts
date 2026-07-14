import { LazyMetadataContainer } from "@decorated-dataloaders/core";
import { CacheMapService } from "../cache-map";
import { DataloaderService } from "../dataloader-service";
import { NestHandlerResolver } from "../handler-resolver";
import { DataloaderModule } from "./dataloader.module";

describe("DataloaderModule", () => {
	it("should register DataloaderService, NestHandlerResolver and CacheMapService globally", () => {
		const dynamicModule = DataloaderModule.forRoot();

		expect(dynamicModule.module).toBe(DataloaderModule);
		expect(dynamicModule.global).toBe(true);
		expect(dynamicModule.exports).toContain(DataloaderService);
		expect(dynamicModule.providers).toContain(DataloaderService);
		expect(dynamicModule.providers).toContain(NestHandlerResolver);
	});

	it("should register CacheMapService configured with the given options", () => {
		const getCacheMap = () => new Map();
		const dynamicModule = DataloaderModule.forRoot({ name: "MyLoader", cache: true, maxBatchSize: 50, getCacheMap });

		const cacheMapProvider = (dynamicModule.providers as any[]).find((provider) => provider?.provide === CacheMapService);

		expect(cacheMapProvider).toBeDefined();
		expect(cacheMapProvider.useValue).toBeInstanceOf(CacheMapService);
		expect(cacheMapProvider.useValue.name).toBe("MyLoader");
		expect(cacheMapProvider.useValue.cache).toBe(true);
		expect(cacheMapProvider.useValue.maxBatchSize).toBe(50);
		expect(cacheMapProvider.useValue.getCacheMap).toBe(getCacheMap);
	});

	it("should load relationship and alias metadata on module init", async () => {
		const loadRelationships = vi.spyOn(LazyMetadataContainer, "loadRelationshipMetadata");
		const loadAliases = vi.spyOn(LazyMetadataContainer, "loadAliasMetadata");

		await new DataloaderModule().onModuleInit();

		expect(loadRelationships).toHaveBeenCalledTimes(1);
		expect(loadAliases).toHaveBeenCalledTimes(1);

		loadRelationships.mockRestore();
		loadAliases.mockRestore();
	});
});
