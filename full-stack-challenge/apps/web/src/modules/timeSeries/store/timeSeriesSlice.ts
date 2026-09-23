import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CreateTimeSeriesRequest,
  SensorOption,
  TimeSeriesDetail,
  TimeSeriesMetrics,
  TimeSeriesSummary,
} from "@dynamoxtest/shared";
import { getErrorMessage } from "../../../services/api/errors";
import { monitoringPointsApi } from "../../../services/monitoringPoints/monitoringPointsApi";
import {
  timeSeriesApi,
  type TimeRange,
} from "../../../services/timeSeries/timeSeriesApi";
import { createAppAsyncThunk } from "../../../app/store/hooks";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface TimeSeriesState {
  list: TimeSeriesSummary[];
  count: number | null;
  listStatus: Status;
  sensors: SensorOption[];
  sensorFilter?: string;
  detail: {
    series: TimeSeriesDetail | null;
    metrics: TimeSeriesMetrics | null;
    status: Status;
  };
}

const initialState: TimeSeriesState = {
  list: [],
  count: null,
  listStatus: "idle",
  sensors: [],
  detail: { series: null, metrics: null, status: "idle" },
};

export const fetchTimeSeriesOverview = createAppAsyncThunk(
  "timeSeries/fetchOverview",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const [list, count] = await Promise.all([
        timeSeriesApi.list(getState().timeSeries.sensorFilter),
        timeSeriesApi.count(),
      ]);
      return { list, count };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSensorOptions = createAppAsyncThunk(
  "timeSeries/fetchSensors",
  async (_: void, { rejectWithValue }) => {
    try {
      return await monitoringPointsApi.listSensors();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createTimeSeries = createAppAsyncThunk(
  "timeSeries/create",
  async (
    { sensorId, body }: { sensorId: string; body: CreateTimeSeriesRequest },
    { rejectWithValue },
  ) => {
    try {
      return await timeSeriesApi.create(sensorId, body);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteTimeSeries = createAppAsyncThunk(
  "timeSeries/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await timeSeriesApi.remove(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchTimeSeriesDetail = createAppAsyncThunk(
  "timeSeries/fetchDetail",
  async (
    { id, range = {} }: { id: string; range?: TimeRange },
    { rejectWithValue },
  ) => {
    try {
      const [series, metrics] = await Promise.all([
        timeSeriesApi.get(id, range),
        timeSeriesApi.metrics(id, range),
      ]);
      return { series, metrics };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const timeSeriesSlice = createSlice({
  name: "timeSeries",
  initialState,
  reducers: {
    setSensorFilter(state, action: PayloadAction<string | undefined>) {
      state.sensorFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeSeriesOverview.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchTimeSeriesOverview.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.list = action.payload.list;
        state.count = action.payload.count;
      })
      .addCase(fetchTimeSeriesOverview.rejected, (state) => {
        state.listStatus = "failed";
      })
      .addCase(fetchSensorOptions.fulfilled, (state, action) => {
        state.sensors = action.payload;
      })
      .addCase(createTimeSeries.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.count = (state.count ?? 0) + 1;
      })
      .addCase(deleteTimeSeries.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        state.count = Math.max(0, (state.count ?? 1) - 1);
        if (state.detail.series?.id === action.payload) {
          state.detail = initialState.detail;
        }
      })
      .addCase(fetchTimeSeriesDetail.pending, (state) => {
        state.detail.status = "loading";
      })
      .addCase(fetchTimeSeriesDetail.fulfilled, (state, action) => {
        state.detail.status = "succeeded";
        state.detail.series = action.payload.series;
        state.detail.metrics = action.payload.metrics;
      })
      .addCase(fetchTimeSeriesDetail.rejected, (state) => {
        state.detail.status = "failed";
      });
  },
});

export const { setSensorFilter } = timeSeriesSlice.actions;
export default timeSeriesSlice.reducer;
