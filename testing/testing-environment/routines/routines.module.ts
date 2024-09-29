import { Module } from "@nestjs/common";
import { TestClientModule } from "../test-client/test-client.module";
import { RoutinesService } from "./routines.service";

@Module({
	imports: [TestClientModule],
	providers: [RoutinesService],
	exports: [RoutinesService],
})
export class RoutinesModule {}
