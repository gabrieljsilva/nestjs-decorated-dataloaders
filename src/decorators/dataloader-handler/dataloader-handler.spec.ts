import { LazyMetadataContainer } from "../../utils";
import { DataloaderHandler } from "./dataloader-handler.decorator";

describe("DataloaderHandler Decorator", () => {
	beforeEach(() => {
		LazyMetadataContainer.clear();
	});

	it("should correctly set metadata for a DataloaderHandler method", () => {
		class TestHandler {
			@DataloaderHandler()
			/* v8 ignore next */
			loadData() {}
		}

		const metadata = LazyMetadataContainer.dataloaderHandlers;

		expect(metadata).toBeDefined();
		const handlerMetadata = metadata.get("loadData");

		expect(handlerMetadata?.provide).toBe(TestHandler);
		expect(handlerMetadata?.field).toBe("loadData");
	});

	it("should correctly use the provided key when setting metadata", () => {
		class TestHandler {
			@DataloaderHandler("customKey")
			/* v8 ignore next */
			loadData() {}
		}

		const metadata = LazyMetadataContainer.dataloaderHandlers;

		expect(metadata).toBeDefined();
		const handlerMetadata = metadata.get("customKey");

		expect(handlerMetadata?.provide).toBe(TestHandler);
		expect(handlerMetadata?.field).toBe("loadData");
	});

	it("should not override a previously set DataloaderHandler key", () => {
		class TestHandler {
			@DataloaderHandler("duplicateKey")
			/* v8 ignore next */
			loadData() {}
		}

		try {
			DataloaderHandler("duplicateKey")(TestHandler, "loadData");
		} catch (error) {
			expect(error.message).toBe("Dataloader handler with key duplicateKey already exists");
		}
	});

	it("should handle multiple DataloaderHandler methods in the same class", () => {
		class TestHandler {
			@DataloaderHandler("firstKey")
			/* v8 ignore next */
			loadFirstData() {}

			@DataloaderHandler("secondKey")
			/* v8 ignore next */
			loadSecondData() {}
		}

		const metadata = LazyMetadataContainer.dataloaderHandlers;

		expect(metadata).toBeDefined();
		const firstHandlerMetadata = metadata.get("firstKey");
		const secondHandlerMetadata = metadata.get("secondKey");

		expect(firstHandlerMetadata?.provide).toBe(TestHandler);
		expect(firstHandlerMetadata?.field).toBe("loadFirstData");

		expect(secondHandlerMetadata?.provide).toBe(TestHandler);
		expect(secondHandlerMetadata?.field).toBe("loadSecondData");
	});
});
