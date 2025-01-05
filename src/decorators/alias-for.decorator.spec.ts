import { dataloaderMetadata } from "../constants";
import { AliasFor } from "./alias-for.decorator";

describe("AliasFor Decorator", () => {
	abstract class Base {}

	beforeEach(() => {
		dataloaderMetadata.start();
	});

	it("should correctly set alias metadata for a target class", () => {
		@AliasFor(() => Base)
		class Target extends Base {}

		const metadata = dataloaderMetadata.resolveAliases();

		const alias = metadata.get(Target);
		expect(alias).toBe(Base);
	});

	it("should throw an error if alias is already defined for the same target class", () => {
		try {
			@AliasFor(() => Base)
			class Target extends Base {}

			AliasFor(() => Base)(Target);
		} catch (error) {
			expect(error).toBeDefined();
		}
	});
});
