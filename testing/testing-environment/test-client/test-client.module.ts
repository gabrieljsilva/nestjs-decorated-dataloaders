import { Module } from "@nestjs/common";
import { TestServerModule } from "../test-server/test-server.module";
import { TestClientService } from "./test-client.service";

@Module({
	imports: [TestServerModule],
	providers: [TestClientService],
	exports: [TestClientService],
})
export class TestClientModule {}
