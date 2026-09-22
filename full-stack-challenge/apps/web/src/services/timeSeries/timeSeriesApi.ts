import type {
  CreateTimeSeriesRequest,
  TimeSeriesDetail,
  TimeSeriesMetrics,
  TimeSeriesSummary,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export const timeSeriesApi = {
  list: () => http.get<TimeSeriesSummary[]>("/time-series").then((r) => r.data),
  count: () =>
    http.get<{ count: number }>("/time-series/count").then((r) => r.data.count),
  get: (id: string) =>
    http.get<TimeSeriesDetail>(`/time-series/${id}`).then((r) => r.data),
  metrics: (id: string) =>
    http
      .get<TimeSeriesMetrics>(`/time-series/${id}/metrics`)
      .then((r) => r.data),
  create: (sensorId: string, body: CreateTimeSeriesRequest) =>
    http
      .post<TimeSeriesSummary>(`/sensors/${sensorId}/time-series`, body)
      .then((r) => r.data),
  remove: (id: string) => http.delete(`/time-series/${id}`).then(() => id),
};
