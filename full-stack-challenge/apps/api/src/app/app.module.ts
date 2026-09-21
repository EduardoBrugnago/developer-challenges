import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { HealthController } from "./health.controller";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthModule } from "../auth/auth.module";
import { MachinesModule } from "../machines/machines.module";
import { MonitoringPointsModule } from "../monitoring-points/monitoring-points.module";
import { TimeSeriesModule } from "../time-series/time-series.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MachinesModule,
    MonitoringPointsModule,
    TimeSeriesModule
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}