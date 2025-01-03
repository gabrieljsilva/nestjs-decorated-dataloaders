import { dataloaderMetadata } from "../constants";
import { DataloaderHandlerMetadata } from "../types/dataloader-handler-metadata";
import { DataloaderHandler } from "./dataloader-handler.decorator";

describe("DataloaderHandler Decorator", () => {
	beforeEach(() => {
		dataloaderMetadata.start();
	});

	it("should correctly set metadata for a DataloaderHandler method", () => {
		class TestHandler {
			@DataloaderHandler()
			loadData() {}
		}

		const metadata = dataloaderMetadata.getDataloaderHandlers();

		expect(metadata).toBeDefined();
		const handlerMetadata = metadata.get("loadData");

		expect(handlerMetadata).toBeInstanceOf(DataloaderHandlerMetadata);
		expect(handlerMetadata?.provide).toBe(TestHandler);
		expect(handlerMetadata?.field).toBe("loadData");
	});

	it("should correctly use the provided key when setting metadata", () => {
		class TestHandler {
			@DataloaderHandler("customKey")
			loadData() {}
		}

		const metadata = dataloaderMetadata.getDataloaderHandlers();

		expect(metadata).toBeDefined();
		const handlerMetadata = metadata.get("customKey");

		expect(handlerMetadata).toBeInstanceOf(DataloaderHandlerMetadata);
		expect(handlerMetadata?.provide).toBe(TestHandler);
		expect(handlerMetadata?.field).toBe("loadData");
	});

	it("should not override a previously set DataloaderHandler key", () => {
		class TestHandler {
			@DataloaderHandler("duplicateKey")
			loadData() {}
		}

		try {
			DataloaderHandler("duplicateKey")(TestHandler, "loadData");
		} catch (error) {
			expect(error).toBeDefined();
		}
	});

	it("should handle multiple DataloaderHandler methods in the same class", () => {
		class TestHandler {
			@DataloaderHandler("firstKey")
			loadFirstData() {}

			@DataloaderHandler("secondKey")
			loadSecondData() {}
		}

		const metadata = dataloaderMetadata.getDataloaderHandlers();

		expect(metadata).toBeDefined();
		const firstHandlerMetadata = metadata.get("firstKey");
		const secondHandlerMetadata = metadata.get("secondKey");

		expect(firstHandlerMetadata).toBeInstanceOf(DataloaderHandlerMetadata);
		expect(firstHandlerMetadata?.provide).toBe(TestHandler);
		expect(firstHandlerMetadata?.field).toBe("loadFirstData");

		expect(secondHandlerMetadata).toBeInstanceOf(DataloaderHandlerMetadata);
		expect(secondHandlerMetadata?.provide).toBe(TestHandler);
		expect(secondHandlerMetadata?.field).toBe("loadSecondData");
	});
});
