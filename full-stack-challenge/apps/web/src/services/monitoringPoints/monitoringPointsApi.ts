import type {
  CreateMonitoringPointRequest,
  MonitoringPointListItem,
  MonitoringPointSortField,
  PaginatedResponse,
  SensorOption,
  SortOrder,
  UpsertSensorRequest,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export interface MonitoringPointsQuery {
  page: number;
  limit: number;
  sortBy: MonitoringPointSortField;
  order: SortOrder;
  machineId?: string;
}

export const monitoringPointsApi = {
  list: (params: MonitoringPointsQuery) =>
    http
      .get<PaginatedResponse<MonitoringPointListItem>>("/monitoring-points", {
        params,
      })
      .then((r) => r.data),
  create: (machineId: string, body: CreateMonitoringPointRequest) =>
    http
      .post<MonitoringPointListItem>(
        `/machines/${machineId}/monitoring-points`,
        body,
      )
      .then((r) => r.data),
  remove: (id: string) =>
    http.delete(`/monitoring-points/${id}`).then(() => id),
  upsertSensor: (pointId: string, body: UpsertSensorRequest) =>
    http
      .put<MonitoringPointListItem>(
        `/monitoring-points/${pointId}/sensor`,
        body,
      )
      .then((r) => r.data),
  listSensors: () => http.get<SensorOption[]>("/sensors").then((r) => r.data),
};
