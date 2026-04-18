import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:3100"],
    credentials: true,
  });
  await app.listen(process.env.API_PORT || 3200);
}

bootstrap();
