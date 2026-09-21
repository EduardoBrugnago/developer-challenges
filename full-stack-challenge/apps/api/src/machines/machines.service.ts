import { Machine, MachineType } from "@prisma/client";
import {
  isSensorModelAllowed,
  MACHINE_TYPE_LABELS,
  SENSOR_MODEL_LABELS,
  type Machine as MachineResponse,
} from "@dynamoxtest/shared";
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMachineDto } from "./dto/create-machine.dto";
import { UpdateMachineDto } from "./dto/update-machine.dto";

type MachineWithCount = Machine & { _count: { monitoringPoints: number } };

function toResponse(machine: MachineWithCount): MachineResponse {
  return {
    id: machine.id,
    name: machine.name,
    type: machine.type,
    monitoringPointsCount: machine._count.monitoringPoints,
    createdAt: machine.createdAt.toISOString(),
    updatedAt: machine.updatedAt.toISOString(),
  };
}

const withCount = { _count: { select: { monitoringPoints: true } } } as const;

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<MachineResponse[]> {
    const machines = await this.prisma.machine.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: withCount,
    });

    return machines.map(toResponse);
  }

  async findOne(userId: string, id: string): Promise<MachineResponse> {
    return toResponse(await this.findOwnedOrThrow(userId, id));
  }

  async create(
    userId: string,
    dto: CreateMachineDto,
  ): Promise<MachineResponse> {
    const machine = await this.prisma.machine.create({
      data: { ...dto, userId },
      include: withCount,
    });

    return toResponse(machine);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateMachineDto,
  ): Promise<MachineResponse> {
    const current = await this.findOwnedOrThrow(userId, id);

    if (dto.type && dto.type !== current.type) {
      await this.ensureSensorsCompatibleWith(id, dto.type);
    }

    const machine = await this.prisma.machine.update({
      where: { id },
      data: dto,
      include: withCount,
    });

    return toResponse(machine);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);

    await this.prisma.machine.delete({ where: { id } });
  }

  private async findOwnedOrThrow(
    userId: string,
    id: string,
  ): Promise<MachineWithCount> {
    const machine = await this.prisma.machine.findFirst({
      where: { id, userId },
      include: withCount,
    });
    if (!machine) throw new NotFoundException(`Machine ${id} not found`);
    return machine;
  }

  private async ensureSensorsCompatibleWith(
    machineId: string,
    newType: MachineType,
  ): Promise<void> {
    const sensors = await this.prisma.sensor.findMany({
      where: { monitoringPoint: { machineId } },
      select: { model: true },
    });
    const incompatible = [...new Set(sensors.map((s) => s.model))].filter(
      (model) => !isSensorModelAllowed(newType, model),
    );
    if (incompatible.length > 0) {
      const models = incompatible.map((m) => SENSOR_MODEL_LABELS[m]).join(", ");
      throw new UnprocessableEntityException(
        `Cannot change type to ${MACHINE_TYPE_LABELS[newType]}: machine has ${models} sensor, which are not allowed on this type`,
      );
    }
  }
}
