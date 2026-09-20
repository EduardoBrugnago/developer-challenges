import { MachineType } from "./domain";

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
