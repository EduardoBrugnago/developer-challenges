import { MachineType, PrismaClient, SensorModel } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MACHINES: { name: string; type: MachineType; points: string[] }[] = [
  {
    name: "Exhaust Fan 01",
    type: "FAN",
    points: ["Bearing DE", "Bearing NDE", "Motor"],
  },
  {
    name: "Exhaust Fan 02",
    type: "FAN",
    points: ["Bearing DE", "Bearing NDE"],
  },
  {
    name: "Cooling Tower Fan",
    type: "FAN",
    points: ["Motor DE", "Motor NDE", "Gearbox"],
  },
  {
    name: "Water Pump 01",
    type: "PUMP",
    points: ["Motor", "Pump DE", "Pump NDE"],
  },
  { name: "Booster Pump", type: "PUMP", points: ["Motor", "Impeller"] },
  { name: "Slurry Pump", type: "PUMP", points: ["Motor DE", "Motor NDE"] },
];

const FAN_MODELS: SensorModel[] = ["HF_PLUS", "TC_AG", "TC_AS"];

const SERIES = [
  { name: "Velocity", unit: "mm/s", base: 2, amplitude: 0.6, trend: 0.0005 },
  { name: "Temperature", unit: "°C", base: 45, amplitude: 3, trend: 0.002 },
];

const POINTS_PER_SERIES = 1440; 
const INTERVAL_MS = 60_000;
const CHUNK_SIZE = 5_000; 

/** Synthetic signal: base level + oscillation + slight upward trend + noise. */
function generateSignal(base: number, amplitude: number, trend: number) {
  const start = Date.now() - (POINTS_PER_SERIES - 1) * INTERVAL_MS;
  return Array.from({ length: POINTS_PER_SERIES }, (_, i) => ({
    timestamp: new Date(start + i * INTERVAL_MS),
    value: Number(
      (
        base +
        Math.sin(i / 30) * amplitude +
        i * trend +
        (Math.random() - 0.5) * amplitude * 0.5
      ).toFixed(4),
    ),
  }));
}

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "admin@dynamox.com";
  const password = process.env.SEED_USER_PASSWORD ?? "dynamox123";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await bcrypt.hash(password, 10) },
  });

  // Start from scratch: deleting the machines cascades to points, sensors, series and data points
  await prisma.machine.deleteMany({ where: { userId: user.id } });

  let sensors = 0;
  let series = 0;
  let dataPoints = 0;

  for (const [m, spec] of MACHINES.entries()) {
    const machine = await prisma.machine.create({
      data: { name: spec.name, type: spec.type, userId: user.id },
    });

    for (const [p, pointName] of spec.points.entries()) {
      const point = await prisma.monitoringPoint.create({
        data: { name: pointName, machineId: machine.id },
      });

      // The third point of each machine stays without a sensor, so the list shows that case too
      if (p === 2) continue;

      // Pump rule: only HF+ on pumps
      const model =
        spec.type === "PUMP"
          ? "HF_PLUS"
          : FAN_MODELS[(m + p) % FAN_MODELS.length];
      const sensor = await prisma.sensor.create({
        data: {
          uniqueId: `DX-${String(++sensors).padStart(4, "0")}`,
          model,
          monitoringPointId: point.id,
        },
      });

      for (const s of SERIES) {
        const created = await prisma.timeSeries.create({
          data: { name: s.name, unit: s.unit, sensorId: sensor.id },
        });
        const rows = generateSignal(s.base, s.amplitude, s.trend).map((pt) => ({
          ...pt,
          seriesId: created.id,
        }));
        for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
          await prisma.dataPoint.createMany({
            data: rows.slice(i, i + CHUNK_SIZE),
          });
        }
        series++;
        dataPoints += rows.length;
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
