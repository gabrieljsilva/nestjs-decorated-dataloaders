import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../app/app.module";

@Injectable()
export class TestServerService implements OnModuleInit {
	public app: INestApplication;

	private readonly createTestServer = async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		const app = module.createNestApplication();
		await app.init();
		this.app = app;
	};

	async onModuleInit() {
		await this.createTestServer();
	}
}
