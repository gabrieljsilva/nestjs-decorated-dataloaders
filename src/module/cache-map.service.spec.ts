import { TestBed } from "@suites/unit";
import { CacheMapService } from "./cache-map.service";

describe("CacheMapService", () => {
	let service: CacheMapService;

	beforeEach(async () => {
		const { unit } = await TestBed.solitary(CacheMapService).compile();
		service = unit;
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should have default values", () => {
		expect(service.name).toBeUndefined();
		expect(service.cache).toBeUndefined();
		expect(service.maxBatchSize).toBeUndefined();
		expect(service.getCacheMap).toBeUndefined();
	});

	it("should set options from constructor", () => {
		const options = {
			name: "test",
			cache: true,
			maxBatchSize: 100,
			getCacheMap: () => new Map(),
		};
		const serviceWithOptions = new CacheMapService(options);
		expect(serviceWithOptions.name).toBe("test");
		expect(serviceWithOptions.cache).toBe(true);
		expect(serviceWithOptions.maxBatchSize).toBe(100);
		expect(serviceWithOptions.getCacheMap).toBe(options.getCacheMap);
	});
});
