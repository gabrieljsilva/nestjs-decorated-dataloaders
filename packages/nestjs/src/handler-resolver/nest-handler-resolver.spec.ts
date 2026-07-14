import { NestHandlerResolver } from "./nest-handler-resolver";

describe("NestHandlerResolver", () => {
	class PhotoRepository {}

	it("should resolve instances through ModuleRef with strict: false", () => {
		const instance = new PhotoRepository();
		const moduleRef = { get: vi.fn().mockReturnValue(instance) };

		const resolver = new NestHandlerResolver(moduleRef as any);

		expect(resolver.resolveInstance(PhotoRepository)).toBe(instance);
		expect(moduleRef.get).toHaveBeenCalledWith(PhotoRepository, { strict: false });
	});

	it("should return undefined when ModuleRef throws for a missing provider", () => {
		const moduleRef = {
			get: vi.fn().mockImplementation(() => {
				throw new Error("UnknownElementException");
			}),
		};

		const resolver = new NestHandlerResolver(moduleRef as any);

		expect(resolver.resolveInstance(PhotoRepository)).toBeUndefined();
	});
});
