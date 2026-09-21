import {
  MONITORING_POINT_SORT_FIELDS,
  MONITORING_POINTS_PAGE_SIZE,
  SORT_ORDERS,
  type MonitoringPointSortField,
  type SortOrder,
} from "@dynamoxtest/shared";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

export class ListMonitoringPointsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = MONITORING_POINTS_PAGE_SIZE;

  @IsOptional()
  @IsIn(MONITORING_POINT_SORT_FIELDS)
  sortBy: MonitoringPointSortField = "machineName";

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = "asc";

  @IsOptional()
  @IsUUID()
  machineId?: string;
}
