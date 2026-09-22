import {
  MACHINE_SORT_FIELDS,
  MACHINES_PAGE_SIZE,
  SORT_ORDERS,
  type MachineSortField,
  type SortOrder,
} from "@dynamoxtest/shared";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListMachinesQueryDto {
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
  limit = MACHINES_PAGE_SIZE;

  @IsOptional()
  @IsIn(MACHINE_SORT_FIELDS)
  sortBy: MachineSortField = "createdAt";

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = "desc";
}
