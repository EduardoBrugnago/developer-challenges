import { CreateMachineRequest, MACHINE_TYPES } from "@dynamoxtest/shared";
import { MachineType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateMachineDto implements CreateMachineRequest {
  @Transform(({value}) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsIn(MACHINE_TYPES, {message: `type must be one of: ${MACHINE_TYPES.join(', ')}`})
  type!: MachineType
}