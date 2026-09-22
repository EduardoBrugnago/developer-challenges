import type {
  CreateMachineRequest,
  Machine,
  UpdateMachineRequest,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export const machinesApi = {
  list: () => http.get<Machine[]>("/machines").then((r) => r.data),
  create: (body: CreateMachineRequest) =>
    http.post<Machine>("/machines", body).then((r) => r.data),
  update: (id: string, body: UpdateMachineRequest) =>
    http.patch<Machine>(`/machines/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/machines/${id}`).then(() => id),
};
