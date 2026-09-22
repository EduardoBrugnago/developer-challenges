import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  MONITORING_POINTS_PAGE_SIZE,
  type CreateMonitoringPointRequest,
  type MonitoringPointListItem,
  type MonitoringPointSortField,
  type PaginationMeta,
  type SortOrder,
  type UpsertSensorRequest,
} from "@dynamoxtest/shared";
import {
  monitoringPointsApi,
  type MonitoringPointsQuery,
} from "../../../services/monitoringPoints/monitoringPointsApi";
import { getErrorMessage } from "../../../services/api/errors";
import { createAppAsyncThunk } from "../../../app/store/hooks";

export interface MonitoringPointsState {
  items: MonitoringPointListItem[];
  meta: PaginationMeta;
  query: MonitoringPointsQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
}

export const initialState: MonitoringPointsState = {
  items: [],
  meta: {
    page: 1,
    limit: MONITORING_POINTS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
  query: {
    page: 1,
    limit: MONITORING_POINTS_PAGE_SIZE,
    sortBy: "machineName",
    order: "asc",
  },
  status: "idle",
};

export const fetchMonitoringPoints = createAppAsyncThunk(
  "monitoringPoints/fetch",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await monitoringPointsApi.list(getState().monitoringPoints.query);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createMonitoringPoint = createAppAsyncThunk(
  "monitoringPoints/create",
  async (
    {
      machineId,
      body,
    }: { machineId: string; body: CreateMonitoringPointRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const created = await monitoringPointsApi.create(machineId, body);
      await dispatch(fetchMonitoringPoints());
      return created;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const upsertSensor = createAppAsyncThunk(
  "monitoringPoints/upsertSensor",
  async (
    { pointId, body }: { pointId: string; body: UpsertSensorRequest },
    { rejectWithValue },
  ) => {
    try {
      return await monitoringPointsApi.upsertSensor(pointId, body);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteMonitoringPoint = createAppAsyncThunk(
  "monitoringPoints/delete",
  async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
      await monitoringPointsApi.remove(id);
      const { items, query } = getState().monitoringPoints;
      if (items.length === 1 && query.page > 1) {
        dispatch(setPage(query.page - 1));
      } else {
        await dispatch(fetchMonitoringPoints());
      }
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const monitoringPointsSlice = createSlice({
  name: "monitoringPoints",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.query.page = action.payload;
    },
    setSort(
      state,
      action: PayloadAction<{
        sortBy: MonitoringPointSortField;
        order: SortOrder;
      }>,
    ) {
      state.query.sortBy = action.payload.sortBy;
      state.query.order = action.payload.order;
      state.query.page = 1;
    },
    setMachineFilter(state, action: PayloadAction<string | undefined>) {
      state.query.machineId = action.payload;
      state.query.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringPoints.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMonitoringPoints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMonitoringPoints.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(upsertSensor.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export const { setPage, setSort, setMachineFilter } =
  monitoringPointsSlice.actions;
export default monitoringPointsSlice.reducer;
