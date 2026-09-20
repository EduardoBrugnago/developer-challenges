import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { HealthController } from "./health.controller";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}