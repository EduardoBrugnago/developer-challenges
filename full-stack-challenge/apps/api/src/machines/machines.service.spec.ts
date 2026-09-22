import { Test } from "@nestjs/testing";
import {
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { MachinesService } from "./machines.service";
import {
  createPrismaMock,
  prismaMockProvider,
  type PrismaMock,
} from "../test-utils/prisma-mock";

const USER_ID = "user-1";
const machine = (type: "PUMP" | "FAN") => ({
  id: "m-1",
  name: "Machine",
  type,
  userId: USER_ID,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  _count: { monitoringPoints: 2 },
});

describe("MachinesService", () => {
  let service: MachinesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [MachinesService, prismaMockProvider(prisma)],
    }).compile();
    service = moduleRef.get(MachinesService);
  });

  it("creates a machine owned by the current user", async () => {
    prisma.machine.create.mockResolvedValue(machine("FAN") as never);

    const result = await service.create(USER_ID, {
      name: "Machine",
      type: "FAN",
    });

    expect(prisma.machine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: "Machine", type: "FAN", userId: USER_ID },
      }),
    );
    expect(result).toMatchObject({
      id: "m-1",
      monitoringPointsCount: 2,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("blocks changing a Fan to Pump when it has TcAg sensors", async () => {
    prisma.machine.findFirst.mockResolvedValue(machine("FAN") as never);
    prisma.sensor.findMany.mockResolvedValue([{ model: "TC_AG" }] as never);

    await expect(
      service.update(USER_ID, "m-1", { type: "PUMP" }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(prisma.machine.update).not.toHaveBeenCalled();
  });

  it("allows changing a Fan to Pump when all sensors are HF+", async () => {
    prisma.machine.findFirst.mockResolvedValue(machine("FAN") as never);
    prisma.sensor.findMany.mockResolvedValue([{ model: "HF_PLUS" }] as never);
    prisma.machine.update.mockResolvedValue(machine("PUMP") as never);

    await expect(
      service.update(USER_ID, "m-1", { type: "PUMP" }),
    ).resolves.toMatchObject({ type: "PUMP" });
  });

  it("does not check sensors when only the name changes", async () => {
    prisma.machine.findFirst.mockResolvedValue(machine("FAN") as never);
    prisma.machine.update.mockResolvedValue(machine("FAN") as never);

    await service.update(USER_ID, "m-1", { name: "Renamed" });

    expect(prisma.sensor.findMany).not.toHaveBeenCalled();
  });

  it("returns 404 when deleting a machine of another user", async () => {
    prisma.machine.findFirst.mockResolvedValue(null);

    await expect(service.remove(USER_ID, "m-x")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.machine.delete).not.toHaveBeenCalled();
  });

  describe("findAll", () => {
    it.each([
      ["name", "asc", { name: "asc" }],
      ["type", "desc", { type: "desc" }],
      ["createdAt", "desc", { createdAt: "desc" }],
    ] as const)(
      "sorts by %s %s with a tie-breaker in the same direction",
      async (sortBy, order, expectedOrder) => {
        prisma.$transaction.mockResolvedValue([0, []] as never);

        await service.findAll(USER_ID, { page: 1, limit: 10, sortBy, order });

        expect(prisma.machine.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: [expectedOrder, { id: order }] }),
        );
      },
    );

    it("paginates and computes metadata", async () => {
      prisma.$transaction.mockResolvedValue([23, [machine("FAN")]] as never);

      const result = await service.findAll(USER_ID, {
        page: 3,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
      });

      expect(prisma.machine.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 23,
        totalPages: 3,
      });
      expect(result.data[0]).toMatchObject({
        id: "m-1",
        monitoringPointsCount: 2,
      });
    });

    it("reports one page when the user has no machines", async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);

      const result = await service.findAll(USER_ID, {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
      });

      expect(result).toEqual({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      });
    });

    it("only lists machines of the authenticated user", async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);

      await service.findAll(USER_ID, {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
      });

      expect(prisma.machine.count).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
      expect(prisma.machine.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
    });
  });
});
