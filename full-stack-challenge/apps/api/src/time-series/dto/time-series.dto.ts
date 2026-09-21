import { CreateTimeSeriesRequest, DataPointInput, MAX_POINTS_PER_REQUEST } from "@dynamoxtest/shared";
import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from "class-validator";

export class DataPointDto implements DataPointInput{
  @IsISO8601({ strict: true })
  timestamp!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  value!: number;
}

export class PointsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_POINTS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => DataPointDto)
  points!: DataPointDto[];
}

export class CreateTimeSeriesDto
  extends PointsDto
  implements CreateTimeSeriesRequest
{
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class ListTimeSeriesQueryDto {
  @IsOptional()
  @IsUUID()
  sensorId?: string;
}

export class TimeRangeQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
