import type {
  CreateTimeSeriesRequest,
  TimeSeriesDetail,
  TimeSeriesMetrics,
  TimeSeriesSummary,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export interface TimeRange {
  from?: string;
  to?: string;
}

export const timeSeriesApi = {
  list: (sensorId?: string) =>
    http
      .get<TimeSeriesSummary[]>("/time-series", { params: { sensorId } })
      .then((r) => r.data),
  count: () =>
    http.get<{ count: number }>("/time-series/count").then((r) => r.data.count),
  get: (id: string, params: TimeRange = {}) =>
    http
      .get<TimeSeriesDetail>(`/time-series/${id}`, { params })
      .then((r) => r.data),
  metrics: (id: string, params: TimeRange = {}) =>
    http
      .get<TimeSeriesMetrics>(`/time-series/${id}/metrics`, { params })
      .then((r) => r.data),
  create: (sensorId: string, body: CreateTimeSeriesRequest) =>
    http
      .post<TimeSeriesSummary>(`/sensors/${sensorId}/time-series`, body)
      .then((r) => r.data),
  remove: (id: string) => http.delete(`/time-series/${id}`).then(() => id),
};
