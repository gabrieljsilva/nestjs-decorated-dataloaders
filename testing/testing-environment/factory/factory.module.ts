import { Global, Module } from "@nestjs/common";
import { FactoryService } from "./factory.service";

@Global()
@Module({
	providers: [FactoryService],
	exports: [FactoryService],
})
export class FactoryModule {}
