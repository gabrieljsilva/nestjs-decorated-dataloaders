import { SimpleHandlerResolver } from "./simple-handler-resolver";

describe("SimpleHandlerResolver", () => {
	class PhotoRepository {
		async loadByUserIds() {
			return [];
		}
	}

	abstract class AbstractPhotoRepository {}

	it("should resolve a registered instance by its constructor", () => {
		const resolver = new SimpleHandlerResolver();
		const instance = new PhotoRepository();

		resolver.register(instance);

		expect(resolver.resolveInstance(PhotoRepository)).toBe(instance);
	});

	it("should resolve a registered instance by an explicit token", () => {
		const resolver = new SimpleHandlerResolver();
		const instance = new PhotoRepository();

		resolver.register(instance, AbstractPhotoRepository);

		expect(resolver.resolveInstance(AbstractPhotoRepository)).toBe(instance);
	});

	it("should support chained registrations", () => {
		class OtherRepository {}

		const resolver = new SimpleHandlerResolver();
		const photoRepository = new PhotoRepository();
		const otherRepository = new OtherRepository();

		resolver.register(photoRepository).register(otherRepository);

		expect(resolver.resolveInstance(PhotoRepository)).toBe(photoRepository);
		expect(resolver.resolveInstance(OtherRepository)).toBe(otherRepository);
	});

	it("should throw when the instance is not registered", () => {
		const resolver = new SimpleHandlerResolver();

		expect(() => resolver.resolveInstance(PhotoRepository)).toThrowError(
			"cannot find provider: PhotoRepository. Did you forget to register it?",
		);
	});
});
