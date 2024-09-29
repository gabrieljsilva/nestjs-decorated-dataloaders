import { Module } from "@nestjs/common";
import { FactoryModule } from "./factory/factory.module";
import { RoutinesModule } from "./routines/routines.module";
import { TestClientModule } from "./test-client/test-client.module";
import { TestServerModule } from "./test-server/test-server.module";

@Module({
	imports: [TestServerModule, TestClientModule, RoutinesModule, FactoryModule],
})
export class TestingEnvironmentModule {}
