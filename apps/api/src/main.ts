import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3100",
  "http://127.0.0.1:3100",
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const allowedOrigins = new Set(
    [
      ...DEFAULT_ALLOWED_ORIGINS,
      process.env.PUBLIC_SITE_URL,
      process.env.ADMIN_SITE_URL,
    ].filter((value): value is string => Boolean(value)),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });
  await app.listen(process.env.API_PORT || 3200);
}

bootstrap();
