import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TimeSeriesService } from './time-series.service';
import { createPrismaMock, prismaMockProvider, type PrismaMock } from '../test-utils/prisma-mock';

const USER_ID = 'user-1';

const OWNED = { sensor: { monitoringPoint: { machine: { userId: USER_ID } } } };

const seriesWithSummary = {
  id: 'series-1',
  name: 'Velocity',
  unit: 'mm/s',
  sensorId: 'sensor-1',
  createdAt: new Date('2026-09-20T10:00:00.000Z'),
  _count: { dataPoints: 2 },
  sensor: {
    id: 'sensor-1',
    uniqueId: 'HF-001',
    model: 'HF_PLUS',
    monitoringPoint: { name: 'Motor', machine: { name: 'Pump 01' } },
  },
};

describe('TimeSeriesService', () => {
  let service: TimeSeriesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    prisma.$transaction.mockImplementation(((fn: (tx: PrismaMock) => unknown) => fn(prisma)) as never);
    const moduleRef = await Test.createTestingModule({
      providers: [TimeSeriesService, prismaMockProvider(prisma)],
    }).compile();
    service = moduleRef.get(TimeSeriesService);
  });

  describe('create', () => {
    const dto = {
      name: 'Velocity',
      unit: 'mm/s',
      points: [
        { timestamp: '2026-09-20T10:00:00.000Z', value: 2 },
        { timestamp: '2026-09-20T10:01:00.000Z', value: 3 },
      ],
    };

    it('stores the series and its points in one transaction, skipping duplicates', async () => {
      prisma.sensor.findFirst.mockResolvedValue({ id: 'sensor-1' } as never);
      prisma.timeSeries.create.mockResolvedValue({ id: 'series-1' } as never);
      prisma.timeSeries.findUniqueOrThrow.mockResolvedValue(seriesWithSummary as never);

      const result = await service.create(USER_ID, 'sensor-1', dto);

      expect(prisma.timeSeries.create).toHaveBeenCalledWith({
        data: { name: 'Velocity', unit: 'mm/s', sensorId: 'sensor-1' },
      });
      expect(prisma.dataPoint.createMany).toHaveBeenCalledWith({
        data: [
          { seriesId: 'series-1', timestamp: new Date('2026-09-20T10:00:00.000Z'), value: 2 },
          { seriesId: 'series-1', timestamp: new Date('2026-09-20T10:01:00.000Z'), value: 3 },
        ],
        skipDuplicates: true,
      });
      expect(result).toEqual({
        id: 'series-1',
        name: 'Velocity',
        unit: 'mm/s',
        createdAt: '2026-09-20T10:00:00.000Z',
        pointsCount: 2,
        sensor: { id: 'sensor-1', uniqueId: 'HF-001', model: 'HF_PLUS', monitoringPointName: 'Motor', machineName: 'Pump 01' },
      });
    });

    it('returns 404 when the sensor does not belong to the user', async () => {
      prisma.sensor.findFirst.mockResolvedValue(null);

      await expect(service.create(USER_ID, 'other', dto)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.sensor.findFirst).toHaveBeenCalledWith({
        where: { id: 'other', monitoringPoint: { machine: { userId: USER_ID } } },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  it('appends points and reports how many were inserted', async () => {
    prisma.timeSeries.findFirst.mockResolvedValue({ id: 'series-1' } as never);
    prisma.dataPoint.createMany.mockResolvedValue({ count: 1 } as never);

    const result = await service.appendPoints(USER_ID, 'series-1', [{ timestamp: '2026-09-20T10:02:00.000Z', value: 4 }]);

    expect(result).toEqual({ inserted: 1 });
    expect(prisma.dataPoint.createMany).toHaveBeenCalledWith(expect.objectContaining({ skipDuplicates: true }));
  });

  it('counts only the series of the user, optionally filtered by sensor', async () => {
    prisma.timeSeries.count.mockResolvedValue(3 as never);

    await expect(service.count(USER_ID)).resolves.toEqual({ count: 3 });
    expect(prisma.timeSeries.count).toHaveBeenLastCalledWith({ where: OWNED });

    await service.count(USER_ID, 'sensor-1');
    expect(prisma.timeSeries.count).toHaveBeenLastCalledWith({ where: { ...OWNED, sensorId: 'sensor-1' } });
  });

  it('filters the points by time range when from/to are given', async () => {
    prisma.timeSeries.findFirst.mockResolvedValue(seriesWithSummary as never);
    prisma.dataPoint.findMany.mockResolvedValue([{ timestamp: new Date('2026-09-20T10:01:00.000Z'), value: 3 }] as never);

    const result = await service.findOne(USER_ID, 'series-1', {
      from: '2026-09-20T10:01:00.000Z',
      to: '2026-09-20T10:03:00.000Z',
    });

    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          seriesId: 'series-1',
          timestamp: { gte: new Date('2026-09-20T10:01:00.000Z'), lte: new Date('2026-09-20T10:03:00.000Z') },
        },
        orderBy: { timestamp: 'asc' },
      }),
    );
    expect(result.points).toEqual([{ timestamp: '2026-09-20T10:01:00.000Z', value: 3 }]);
  });

  describe('metrics', () => {
    it('returns the database aggregates with ISO dates', async () => {
      prisma.timeSeries.findFirst.mockResolvedValue({ id: 'series-1' } as never);
      prisma.$queryRaw.mockResolvedValue([
        {
          count: 5, min: 2, max: 10, mean: 4, median: 3, stdDev: 3.391,
          startAt: new Date('2026-09-20T10:00:00.000Z'),
          endAt: new Date('2026-09-20T10:04:00.000Z'),
        },
      ] as never);

      await expect(service.metrics(USER_ID, 'series-1')).resolves.toEqual({
        count: 5, min: 2, max: 10, mean: 4, median: 3, stdDev: 3.391,
        startAt: '2026-09-20T10:00:00.000Z',
        endAt: '2026-09-20T10:04:00.000Z',
      });
    });

    it('returns nulls for a series without points', async () => {
      prisma.timeSeries.findFirst.mockResolvedValue({ id: 'series-1' } as never);
      prisma.$queryRaw.mockResolvedValue([
        { count: 0, min: null, max: null, mean: null, median: null, stdDev: null, startAt: null, endAt: null },
      ] as never);

      const result = await service.metrics(USER_ID, 'series-1');

      expect(result).toMatchObject({ count: 0, mean: null, startAt: null, endAt: null });
    });
  });

  it('does not delete a series that belongs to another user', async () => {
    prisma.timeSeries.findFirst.mockResolvedValue(null);

    await expect(service.remove(USER_ID, 'other')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.timeSeries.findFirst).toHaveBeenCalledWith({ where: { id: 'other', ...OWNED } });
    expect(prisma.timeSeries.delete).not.toHaveBeenCalled();
  });
});