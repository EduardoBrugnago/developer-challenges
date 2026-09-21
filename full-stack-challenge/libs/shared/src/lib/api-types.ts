import { MachineType, SensorModel } from "./domain";

/* ---------- Authentication ---------- */
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthUser {
  id: string;
  email: string;
}
export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/* ---------- Machines ---------- */
export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  monitoringPointsCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateMachineRequest {
  name: string;
  type: MachineType;
}
export type UpdateMachineRequest = Partial<CreateMachineRequest>;

/* ---------- Monitoring Points and Sensors ---------- */
export interface SensorSummary {
  id: string;
  uniqueId: string;
  model: SensorModel;
}
export interface MonitoringPointListItem {
  id: string;
  name: string;
  machine: { id: string; name: string; type: MachineType };
  sensor: SensorSummary | null;
}
export interface CreateMonitoringPointRequest {
  name: string;
}
export interface UpsertSensorRequest {
  uniqueId: string;
  model: SensorModel;
}

export interface SensorOption extends SensorSummary {
  monitoringPointName: string;
  machineName: string;
}

/* ---------- Pagination ---------- */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}