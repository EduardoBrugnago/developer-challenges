import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { MonitoringPointsService } from "./monitoring-points.service";
import { JwtPayload } from "../common/types/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateMonitoringPointDto } from "./dto/create-monitoring-point.dto";
import { ListMonitoringPointsQueryDto } from "./dto/list-monitoring-points-query.dto";
import { UpsertSensorDto } from "./dto/upsert-sensor.dto";

@Controller()
export class MonitoringPointsController {
  constructor(private readonly service: MonitoringPointsService) {}

  @Post("machines/:machineId/monitoring-points")
  create(
    @CurrentUser() user: JwtPayload,
    @Param("machineId", ParseUUIDPipe) machineId: string,
    @Body() dto: CreateMonitoringPointDto,
  ) {
    return this.service.create(user.sub, machineId, dto);
  }

  @Get("monitoring-points")
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMonitoringPointsQueryDto,
  ) {
    return this.service.list(user.sub, query);
  }

  @Patch("monitoring-points/:id")
  rename(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateMonitoringPointDto,
  ) {
    return this.service.rename(user.sub, id, dto);
  }

  @Delete("monitoring-points/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(user.sub, id);
  }

  @Put("monitoring-points/:id/sensor")
  upsertSensor(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertSensorDto,
  ) {
    return this.service.upsertSensor(user.sub, id, dto);
  }

  @Delete("monitoring-points/:id/sensor")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSensor(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.removeSensor(user.sub, id);
  }

  @Get("sensors")
  listSensors(@CurrentUser() user: JwtPayload) {
    return this.service.listSensors(user.sub);
  }
}
