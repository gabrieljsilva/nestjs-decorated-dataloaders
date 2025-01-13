import { Inject, Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { LazyMetadataContainer } from "../../utils";

@Injectable()
export class ExplorerService {
	constructor(
		@Inject(ModuleRef)
		private readonly moduleRef: ModuleRef,
	) {}

	findMetadataHandlerByName(handlerName: string) {
		const provider = LazyMetadataContainer.dataloaderHandlers.get(handlerName);

		if (!provider) {
			throw new Error(`cannot find provider: ${handlerName}`);
		}

		const resolvedProvider = LazyMetadataContainer.loadedAliases.get(provider.provide);

		const repository = this.moduleRef.get(resolvedProvider || provider.provide, { strict: false });

		// /**
		//  * PS: using strict: false allows us to load all providers from the module globally or not
		//  * using strict: true will only load providers from the current module
		//  * however, it's not possible to use providers imported from other modules
		//  * using "import" statement, but it's possible to use providers using "providers"
		//  * option in the module registration;
		//  *
		//  * Is not recommended to use moduleRef in the constructor: https://github.com/nestjs/nest/issues/4368
		//  * The module should be used in onModuleInit lifecycle hook, this way dependencies are resolved correctly;
		//  *
		//  */

		if (!repository) {
			throw new Error(`cannot find provider: ${provider.provide.name}`);
		}

		return {
			repository: repository,
			provider: provider,
		};
	}
}
