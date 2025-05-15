import { DynamicModule } from "@nestjs/common";
import { DatabaseService } from "./database.service";

export class DatabaseModule {
	static forRoot(): DynamicModule {
		return {
			module: DatabaseModule,
			providers: [DatabaseService],
			exports: [DatabaseService],
			global: true,
		};
	}
}
