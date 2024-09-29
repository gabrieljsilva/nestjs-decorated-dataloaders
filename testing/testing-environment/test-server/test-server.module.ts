import { Module } from "@nestjs/common";
import { TestServerService } from "./test-server.service";

@Module({
	providers: [TestServerService],
	exports: [TestServerService],
})
export class TestServerModule {}
