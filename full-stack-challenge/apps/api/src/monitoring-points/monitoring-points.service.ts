import {
  isSensorModelAllowed,
  MACHINE_TYPE_LABELS,
  MonitoringPointListItem,
  MonitoringPointSortField,
  PaginatedResponse,
  SENSOR_MODEL_LABELS,
  SensorOption,
  SortOrder,
} from "@dynamoxtest/shared";
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ListMonitoringPointsQueryDto } from "./dto/list-monitoring-points-query.dto";
import { CreateMonitoringPointDto } from "./dto/create-monitoring-point.dto";
import { UpsertSensorDto } from "./dto/upsert-sensor.dto";

const ORDER_BY: Record<
  MonitoringPointSortField,
  (order: SortOrder) => Prisma.MonitoringPointOrderByWithRelationInput
> = {
  machineName: (order) => ({ machine: { name: order } }),
  machineType: (order) => ({ machine: { type: order } }),
  monitoringPointName: (order) => ({ name: order }),
  sensorModel: (order) => ({ sensor: { model: order } }),
};

const listInclude = {
  machine: { select: { id: true, name: true, type: true } },
  sensor: { select: { id: true, uniqueId: true, model: true } },
} satisfies Prisma.MonitoringPointInclude;

type PointWithRelations = Prisma.MonitoringPointGetPayload<{
  include: typeof listInclude;
}>;

function toListItem(point: PointWithRelations): MonitoringPointListItem {
  return {
    id: point.id,
    name: point.name,
    machine: point.machine,
    sensor: point.sensor,
  };
}

@Injectable()
export class MonitoringPointsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    query: ListMonitoringPointsQueryDto,
  ): Promise<PaginatedResponse<MonitoringPointListItem>> {
    const { page, limit, sortBy, order, machineId } = query;
    const where: Prisma.MonitoringPointWhereInput = {
      machine: { userId },
      ...(machineId && { machineId }),
    };

    const [total, points] = await this.prisma.$transaction([
      this.prisma.monitoringPoint.count({ where }),
      this.prisma.monitoringPoint.findMany({
        where,
        include: listInclude,
        orderBy: [ORDER_BY[sortBy](order), { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: points.map(toListItem),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async create(
    userId: string,
    machineId: string,
    dto: CreateMonitoringPointDto,
  ): Promise<MonitoringPointListItem> {
    const machine = await this.prisma.machine.findFirst({
      where: { id: machineId, userId },
    });
    if (!machine) throw new NotFoundException(`Machine ${machineId} not found`);

    const point = await this.prisma.monitoringPoint.create({
      data: { name: dto.name, machineId },
      include: listInclude,
    });
    return toListItem(point);
  }

  async rename(
    userId: string,
    id: string,
    dto: CreateMonitoringPointDto,
  ): Promise<MonitoringPointListItem> {
    await this.findOwnedOrThrow(userId, id);
    const point = await this.prisma.monitoringPoint.update({
      where: { id },
      data: { name: dto.name },
      include: listInclude,
    });
    return toListItem(point);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.monitoringPoint.delete({ where: { id } });
  }

  //Associate sensor to point or update a sensor.
  //Rule: TcAg e TcAs cant be used on machine type 'Pump'.
  async upsertSensor(
    userId: string,
    pointId: string,
    dto: UpsertSensorDto,
  ): Promise<MonitoringPointListItem> {
    const point = await this.findOwnedOrThrow(userId, pointId);

    if (!isSensorModelAllowed(point.machine.type, dto.model)) {
      throw new UnprocessableEntityException(
        `${SENSOR_MODEL_LABELS[dto.model]} sensors cannot be installed on ${MACHINE_TYPE_LABELS[point.machine.type]} machines`,
      );
    }

    await this.prisma.sensor.upsert({
      where: { monitoringPointId: pointId },
      create: { ...dto, monitoringPointId: pointId },
      update: dto,
    });

    const updated = await this.prisma.monitoringPoint.findUniqueOrThrow({
      where: { id: pointId },
      include: listInclude,
    });
    return toListItem(updated);
  }

  async removeSensor(userId: string, pointId: string): Promise<void> {
    const point = await this.findOwnedOrThrow(userId, pointId);
    if (!point.sensor)
      throw new NotFoundException("This monitoring point has no sensor");
    await this.prisma.sensor.delete({ where: { monitoringPointId: pointId } });
  }

  async listSensors(userId: string): Promise<SensorOption[]> {
    const sensors = await this.prisma.sensor.findMany({
      where: { monitoringPoint: { machine: { userId } } },
      include: {
        monitoringPoint: {
          select: { name: true, machine: { select: { name: true } } },
        },
      },
      orderBy: { uniqueId: "asc" },
    });
    return sensors.map((s) => ({
      id: s.id,
      uniqueId: s.uniqueId,
      model: s.model,
      monitoringPointName: s.monitoringPoint.name,
      machineName: s.monitoringPoint.machine.name,
    }));
  }

  private async findOwnedOrThrow(userId: string, id: string) {
    const point = await this.prisma.monitoringPoint.findFirst({
      where: { id, machine: { userId } },
      include: { machine: true, sensor: true },
    });
    if (!point) throw new NotFoundException(`Monitoring point ${id} not found`);
    return point;
  }
}
