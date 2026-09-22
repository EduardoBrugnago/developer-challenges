import type {
  CreateMachineRequest,
  Machine,
  MachineOption,
  MachineSortField,
  PaginatedResponse,
  SortOrder,
  UpdateMachineRequest,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export interface MachinesQuery {
  page: number;
  limit: number;
  sortBy: MachineSortField;
  order: SortOrder;
}

export const machinesApi = {
  list: (params: MachinesQuery) =>
    http
      .get<PaginatedResponse<Machine>>("/machines", { params })
      .then((r) => r.data),
  options: () =>
    http.get<MachineOption[]>("/machines/options").then((r) => r.data),
  create: (body: CreateMachineRequest) =>
    http.post<Machine>("/machines", body).then((r) => r.data),
  update: (id: string, body: UpdateMachineRequest) =>
    http.patch<Machine>(`/machines/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/machines/${id}`).then(() => id),
};
