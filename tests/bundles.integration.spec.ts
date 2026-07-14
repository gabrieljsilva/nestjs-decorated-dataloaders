import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);

const coreDist = join(__dirname, "../packages/core/dist");
const nestjsDist = join(__dirname, "../packages/nestjs/dist");

describe("built packages integration", () => {
	beforeAll(() => {
		if (!existsSync(join(coreDist, "index.cjs.js")) || !existsSync(join(nestjsDist, "index.cjs.js"))) {
			throw new Error("dist not found — run `npm run build` before the integration tests");
		}
	});

	it("core CJS bundle batches and maps relationships end-to-end", async () => {
		const { Load, DataloaderHandler, LazyMetadataContainer, DataloaderContext, SimpleHandlerResolver } = require(
			join(coreDist, "index.cjs.js"),
		);

		LazyMetadataContainer.clear();

		class Photo {}
		class User {}
		Load(() => [Photo], { key: "id", parentKey: "userId", handler: "LOAD_PHOTOS_BUNDLE" })(User.prototype, "photos");

		const calls: number[][] = [];
		class PhotoRepository {
			async loadByUserIds(userIds: number[]) {
				calls.push(userIds);
				return userIds.map((userId) => ({ id: userId * 10, userId }));
			}
		}
		DataloaderHandler("LOAD_PHOTOS_BUNDLE")(PhotoRepository.prototype, "loadByUserIds");

		LazyMetadataContainer.loadRelationshipMetadata();
		LazyMetadataContainer.loadAliasMetadata();

		const context = new DataloaderContext({
			handlerResolver: new SimpleHandlerResolver().register(new PhotoRepository()),
		});

		const results = await Promise.all(
			[1, 2, 3].map((id) => context.load({ from: User, field: "photos", parent: { id } })),
		);

		expect(calls).toEqual([[1, 2, 3]]);
		expect(results).toEqual([[{ id: 10, userId: 1 }], [{ id: 20, userId: 2 }], [{ id: 30, userId: 3 }]]);

		LazyMetadataContainer.clear();
	});

	it("core ESM bundle exposes the same public API", async () => {
		const esm = await import(join(coreDist, "index.esm.mjs"));

		for (const name of [
			"Load",
			"DataloaderHandler",
			"AliasFor",
			"LazyMetadataContainer",
			"DataloaderContext",
			"SimpleHandlerResolver",
			"DataloaderMapper",
			"resolvePath",
		]) {
			expect(esm[name], `core esm should export ${name}`).toBeDefined();
		}
	});

	it("core bundles do not reference any @nestjs package", () => {
		for (const file of ["index.cjs.js", "index.esm.mjs", "index.d.ts"]) {
			const content = readFileSync(join(coreDist, file), "utf-8");
			expect(content.includes("@nestjs"), `${file} should not reference @nestjs`).toBe(false);
		}
	});

	it("core package.json declares no @nestjs dependency", () => {
		const packageJson = JSON.parse(readFileSync(join(coreDist, "../package.json"), "utf-8"));
		const allDeps = Object.keys({
			...packageJson.dependencies,
			...packageJson.peerDependencies,
			...packageJson.optionalDependencies,
		});

		expect(allDeps.some((dep) => dep.startsWith("@nestjs/"))).toBe(false);
	});

	it("nestjs CJS bundle exposes the adapter and re-exports the core API", () => {
		const nestjs = require(join(nestjsDist, "index.cjs.js"));

		for (const name of [
			"DataloaderModule",
			"DataloaderService",
			"CacheMapService",
			"NestHandlerResolver",
			"Load",
			"DataloaderHandler",
			"AliasFor",
			"LazyMetadataContainer",
		]) {
			expect(nestjs[name], `nestjs cjs should export ${name}`).toBeDefined();
		}
	});

	it("nestjs bundle wires DataloaderModule.forRoot with the built CacheMapService", () => {
		const { DataloaderModule, DataloaderService, CacheMapService } = require(join(nestjsDist, "index.cjs.js"));

		const dynamicModule = DataloaderModule.forRoot({ name: "BundleLoader", maxBatchSize: 10 });

		expect(dynamicModule.global).toBe(true);
		expect(dynamicModule.exports).toContain(DataloaderService);

		const cacheMapProvider = dynamicModule.providers.find((provider: any) => provider?.provide === CacheMapService);
		expect(cacheMapProvider.useValue.name).toBe("BundleLoader");
		expect(cacheMapProvider.useValue.maxBatchSize).toBe(10);
	});
});
