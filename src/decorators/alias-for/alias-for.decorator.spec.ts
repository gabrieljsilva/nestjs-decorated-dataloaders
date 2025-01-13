import { LazyMetadataContainer } from "../../utils";
import { AliasFor } from "./alias-for.decorator";

describe("AliasFor Decorator", () => {
	abstract class Repository {}

	beforeEach(() => {
		LazyMetadataContainer.clear();
	});

	it("should correctly set alias metadata for a target class", () => {
		@AliasFor(() => Repository)
		class UserRepository extends Repository {}

		LazyMetadataContainer.loadAliasMetadata();

		const alias = LazyMetadataContainer.loadedAliases.get(UserRepository);
		expect(alias).toBe(Repository);
	});
});
