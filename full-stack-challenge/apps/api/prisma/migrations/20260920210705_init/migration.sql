-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('FAN', 'PUMP');

-- CreateEnum
CREATE TYPE "SensorModel" AS ENUM ('HF_PLUS', 'TC_AG', 'TC_AS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MachineType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "model" "SensorModel" NOT NULL,
    "monitoringPointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSeries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "sensorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPoint" (
    "seriesId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("seriesId","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Machine_userId_idx" ON "Machine"("userId");

-- CreateIndex
CREATE INDEX "MonitoringPoint_machineId_idx" ON "MonitoringPoint"("machineId");

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringPoint_machineId_name_key" ON "MonitoringPoint"("machineId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_uniqueId_key" ON "Sensor"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_monitoringPointId_key" ON "Sensor"("monitoringPointId");

-- CreateIndex
CREATE INDEX "TimeSeries_sensorId_idx" ON "TimeSeries"("sensorId");

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringPoint" ADD CONSTRAINT "MonitoringPoint_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_monitoringPointId_fkey" FOREIGN KEY ("monitoringPointId") REFERENCES "MonitoringPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSeries" ADD CONSTRAINT "TimeSeries_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "TimeSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
