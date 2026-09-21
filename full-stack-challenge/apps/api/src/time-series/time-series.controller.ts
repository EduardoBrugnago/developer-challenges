import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";

import { TimeSeriesService } from "./time-series.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../common/types/auth.types";
import { CreateTimeSeriesDto, ListTimeSeriesQueryDto, PointsDto, TimeRangeQueryDto } from "./dto/time-series.dto";

@Controller()
export class TimeSeriesController {
  constructor(private readonly service: TimeSeriesService) {}

  @Post("sensors/:sensorId/time-series")
  create(
    @CurrentUser() user: JwtPayload,
    @Param("sensorId", ParseUUIDPipe) sensorId: string,
    @Body() dto: CreateTimeSeriesDto,
  ) {
    return this.service.create(user.sub, sensorId, dto);
  }

  @Get("time-series")
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListTimeSeriesQueryDto,
  ) {
    return this.service.list(user.sub, query.sensorId);
  }

  @Get("time-series/count")
  count(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListTimeSeriesQueryDto,
  ) {
    return this.service.count(user.sub, query.sensorId);
  }

  @Get("time-series/:id")
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() range: TimeRangeQueryDto,
  ) {
    return this.service.findOne(user.sub, id, range);
  }

  @Post("time-series/:id/points")
  appendPoints(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PointsDto,
  ) {
    return this.service.appendPoints(user.sub, id, dto.points);
  }

  @Delete("time-series/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(user.sub, id);
  }
}
