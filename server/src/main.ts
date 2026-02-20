import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.useGlobalFilters(new PrismaExceptionFilter());
	app.enableCors();
	await app.listen(3000);
	console.log("Server running on http://localhost:3000");
}

bootstrap();
