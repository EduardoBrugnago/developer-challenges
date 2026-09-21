import {
  SENSOR_MODELS,
  type SensorModel,
  type UpsertSensorRequest,
} from "@dynamoxtest/shared";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class UpsertSensorDto implements UpsertSensorRequest {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'uniqueId may contain only letters, numbers, "-" and "_"',
  })
  uniqueId!: string;

  @IsIn(SENSOR_MODELS, {
    message: `model must be one of: ${SENSOR_MODELS.join(", ")}`,
  })
  model!: SensorModel;
}
