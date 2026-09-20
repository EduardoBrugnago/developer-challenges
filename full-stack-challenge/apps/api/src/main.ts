import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import type { NestExpressApplication } from "@nestjs/platform-express";
import { requestTimingMiddleware } from "./common/middleware/request-timing.middleware";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  app.useBodyParser("json", { limit: "5mb" });
  app.use(requestTimingMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
