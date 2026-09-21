import {
  TimeSeriesDetail,
  TimeSeriesMetrics,
  TimeSeriesSummary,
} from "@dynamoxtest/shared";
import { Prisma } from "@prisma/client";
import {
  CreateTimeSeriesDto,
  DataPointDto,
  TimeRangeQueryDto,
} from "./dto/time-series.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const summaryInclude = {
  _count: { select: { dataPoints: true } },
  sensor: {
    select: {
      id: true,
      uniqueId: true,
      model: true,
      monitoringPoint: {
        select: { name: true, machine: { select: { name: true } } },
      },
    },
  },
} satisfies Prisma.TimeSeriesInclude;

type SeriesWithSummary = Prisma.TimeSeriesGetPayload<{
  include: typeof summaryInclude;
}>;

function toSummary(series: SeriesWithSummary): TimeSeriesSummary {
  const { sensor } = series;
  return {
    id: series.id,
    name: series.name,
    unit: series.unit,
    createdAt: series.createdAt.toISOString(),
    pointsCount: series._count.dataPoints,
    sensor: {
      id: sensor.id,
      uniqueId: sensor.uniqueId,
      model: sensor.model,
      monitoringPointName: sensor.monitoringPoint.name,
      machineName: sensor.monitoringPoint.machine.name,
    },
  };
}

function toRows(
  seriesId: string,
  points: DataPointDto[],
): Prisma.DataPointCreateManyInput[] {
  return points.map((p) => ({
    seriesId,
    timestamp: new Date(p.timestamp),
    value: p.value,
  }));
}

interface MetricsRow {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  stdDev: number | null;
  startAt: Date | null;
  endAt: Date | null;
}

@Injectable()
export class TimeSeriesService {
  constructor(private readonly prisma: PrismaService) {}

  private ownedWhere(userId: string): Prisma.TimeSeriesWhereInput {
    return { sensor: { monitoringPoint: { machine: { userId } } } };
  }

  async create(
    userId: string,
    sensorId: string,
    dto: CreateTimeSeriesDto,
  ): Promise<TimeSeriesSummary> {
    const sensor = await this.prisma.sensor.findFirst({
      where: { id: sensorId, monitoringPoint: { machine: { userId } } },
    });
    if (!sensor) throw new NotFoundException(`Sensor ${sensorId} not found`);

    const seriesId = await this.prisma.$transaction(async (tx) => {
      const series = await tx.timeSeries.create({
        data: { name: dto.name, unit: dto.unit, sensorId },
      });
      await tx.dataPoint.createMany({
        data: toRows(series.id, dto.points),
        skipDuplicates: true,
      });
      return series.id;
    });

    return toSummary(
      await this.prisma.timeSeries.findUniqueOrThrow({
        where: { id: seriesId },
        include: summaryInclude,
      }),
    );
  }

  async appendPoints(
    userId: string,
    id: string,
    points: DataPointDto[],
  ): Promise<{ inserted: number }> {
    await this.findOwnedOrThrow(userId, id);
    const { count } = await this.prisma.dataPoint.createMany({
      data: toRows(id, points),
      skipDuplicates: true,
    });
    return { inserted: count };
  }

  async list(userId: string, sensorId?: string): Promise<TimeSeriesSummary[]> {
    const series = await this.prisma.timeSeries.findMany({
      where: { ...this.ownedWhere(userId), ...(sensorId && { sensorId }) },
      include: summaryInclude,
      orderBy: { createdAt: "desc" },
    });
    return series.map(toSummary);
  }

  async count(userId: string, sensorId?: string): Promise<{ count: number }> {
    const count = await this.prisma.timeSeries.count({
      where: { ...this.ownedWhere(userId), ...(sensorId && { sensorId }) },
    });
    return { count };
  }

  async findOne(
    userId: string,
    id: string,
    range: TimeRangeQueryDto,
  ): Promise<TimeSeriesDetail> {
    const series = await this.findOwnedOrThrow(userId, id);
    const points = await this.prisma.dataPoint.findMany({
      where: {
        seriesId: id,
        timestamp: {
          ...(range.from && { gte: new Date(range.from) }),
          ...(range.to && { lte: new Date(range.to) }),
        },
      },
      select: { timestamp: true, value: true },
      orderBy: { timestamp: "asc" },
    });

    return {
      id: series.id,
      name: series.name,
      unit: series.unit,
      createdAt: series.createdAt.toISOString(),
      points: points.map((p) => ({
        timestamp: p.timestamp.toISOString(),
        value: p.value,
      })),
    };
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.timeSeries.delete({ where: { id } });
  }

  private async findOwnedOrThrow(userId: string, id: string) {
    const series = await this.prisma.timeSeries.findFirst({
      where: { id, ...this.ownedWhere(userId) },
    });
    if (!series) throw new NotFoundException(`Time series ${id} not found`);
    return series;
  }
}
