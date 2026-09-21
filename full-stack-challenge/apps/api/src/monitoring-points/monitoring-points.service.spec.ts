import { Test } from "@nestjs/testing";
import {
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { MonitoringPointsService } from "./monitoring-points.service";
import {
  createPrismaMock,
  prismaMockProvider,
  type PrismaMock,
} from "../test-utils/prisma-mock";

const USER_ID = "user-1";

function makePoint(machineType: "PUMP" | "FAN", sensor: unknown = null) {
  return {
    id: "point-1",
    name: "Bearing DE",
    machineId: "machine-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    machine: {
      id: "machine-1",
      name: "Pump 01",
      type: machineType,
      userId: USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sensor,
  };
}

describe("MonitoringPointsService", () => {
  let service: MonitoringPointsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [MonitoringPointsService, prismaMockProvider(prisma)],
    }).compile();
    service = moduleRef.get(MonitoringPointsService);
  });

  describe("upsertSensor", () => {
    it.each(["TC_AG", "TC_AS"] as const)(
      "rejects %s sensors on Pump machines",
      async (model) => {
        prisma.monitoringPoint.findFirst.mockResolvedValue(
          makePoint("PUMP") as never,
        );

        await expect(
          service.upsertSensor(USER_ID, "point-1", { uniqueId: "S-1", model }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(prisma.sensor.upsert).not.toHaveBeenCalled();
      },
    );

    it("accepts HF+ sensors on Pump machines", async () => {
      prisma.monitoringPoint.findFirst.mockResolvedValue(
        makePoint("PUMP") as never,
      );
      prisma.monitoringPoint.findUniqueOrThrow.mockResolvedValue(
        makePoint("PUMP") as never,
      );

      await service.upsertSensor(USER_ID, "point-1", {
        uniqueId: "S-1",
        model: "HF_PLUS",
      });

      expect(prisma.sensor.upsert).toHaveBeenCalledWith({
        where: { monitoringPointId: "point-1" },
        create: {
          uniqueId: "S-1",
          model: "HF_PLUS",
          monitoringPointId: "point-1",
        },
        update: { uniqueId: "S-1", model: "HF_PLUS" },
      });
    });

    it("accepts TcAg sensors on Fan machines", async () => {
      prisma.monitoringPoint.findFirst.mockResolvedValue(
        makePoint("FAN") as never,
      );
      prisma.monitoringPoint.findUniqueOrThrow.mockResolvedValue(
        makePoint("FAN") as never,
      );

      await expect(
        service.upsertSensor(USER_ID, "point-1", {
          uniqueId: "S-2",
          model: "TC_AG",
        }),
      ).resolves.toBeDefined();
    });

    it("returns 404 when the point does not belong to the user", async () => {
      prisma.monitoringPoint.findFirst.mockResolvedValue(null);

      await expect(
        service.upsertSensor(USER_ID, "other", {
          uniqueId: "S-1",
          model: "HF_PLUS",
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("list", () => {
    it.each([
      ["machineName", { machine: { name: "asc" } }],
      ["machineType", { machine: { type: "asc" } }],
      ["monitoringPointName", { name: "asc" }],
      ["sensorModel", { sensor: { model: "asc" } }],
    ] as const)(
      "sorts by %s with a stable tie-breaker",
      async (sortBy, expectedOrder) => {
        prisma.$transaction.mockResolvedValue([0, []] as never);

        await service.list(USER_ID, {
          page: 1,
          limit: 5,
          sortBy,
          order: "asc",
        });

        expect(prisma.monitoringPoint.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: [expectedOrder, { id: "asc" }] }),
        );
      },
    );

    it("paginates with 5 items per page and computes metadata", async () => {
      prisma.$transaction.mockResolvedValue([12, []] as never);

      const result = await service.list(USER_ID, {
        page: 3,
        limit: 5,
        sortBy: "machineName",
        order: "desc",
      });

      expect(prisma.monitoringPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
      expect(result.meta).toEqual({
        page: 3,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it("only lists points of the authenticated user", async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);

      await service.list(USER_ID, {
        page: 1,
        limit: 5,
        sortBy: "machineName",
        order: "asc",
      });

      expect(prisma.monitoringPoint.count).toHaveBeenCalledWith({
        where: { machine: { userId: USER_ID } },
      });
    });
  });
});
