import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import fastifyHelmet from "@fastify/helmet";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

const parseCorsOrigin = (value?: string) => {
  if (!value || value === "*") {
    return true;
  }

  return value.split(",").map((origin) => origin.trim());
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  app.setGlobalPrefix("api");
  await app.register(fastifyHelmet);
  app.enableCors({
    origin: parseCorsOrigin(configService.get<string>("CORS_ORIGIN")),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(configService.get<string>("PORT") ?? 4000);
  await app.listen(port);
}

void bootstrap();
