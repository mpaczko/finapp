import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";

import { AppModule } from "./app.module";

const parseCorsOrigin = (value?: string) => {
  if (!value || value === "*") {
    return true;
  }

  return value.split(",").map((origin) => origin.trim());
};

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  const configService = app.get(ConfigService);

  app.setGlobalPrefix("api");
  server.use(helmet());
  server.use(
    cors({
      origin: parseCorsOrigin(configService.get<string>("CORS_ORIGIN")),
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const rawPort = configService.get<string>("PORT");
  console.log("Config PORT:", rawPort);
  const port = Number(rawPort ?? 4000);
  console.log(`Listening on port ${port}`);
  try {
    await app.listen(port, "0.0.0.0");
    console.log("Server started");
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

void bootstrap();
