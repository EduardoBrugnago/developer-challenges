import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  MACHINES_PAGE_SIZE,
  type CreateMachineRequest,
  type Machine,
  type MachineOption,
  type MachineSortField,
  type PaginationMeta,
  type SortOrder,
  type UpdateMachineRequest,
} from "@dynamoxtest/shared";
import {
  machinesApi,
  type MachinesQuery,
} from "../../../services/machines/machinesApi";
import { getErrorMessage } from "../../../services/api/errors";
import { createAppAsyncThunk } from "../../../app/store/hooks";

interface MachinesState {
  items: Machine[];
  options: MachineOption[];
  meta: PaginationMeta;
  query: MachinesQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: MachinesState = {
  items: [],
  options: [],
  meta: { page: 1, limit: MACHINES_PAGE_SIZE, total: 0, totalPages: 1 },
  query: {
    page: 1,
    limit: MACHINES_PAGE_SIZE,
    sortBy: "createdAt",
    order: "desc",
  },
  status: "idle",
};

export const fetchMachines = createAppAsyncThunk(
  "machines/fetchPage",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await machinesApi.list(getState().machines.query);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMachineOptions = createAppAsyncThunk(
  "machines/fetchOptions",
  async (_: void, { rejectWithValue }) => {
    try {
      return await machinesApi.options();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createMachine = createAppAsyncThunk(
  "machines/create",
  async (body: CreateMachineRequest, { dispatch, rejectWithValue }) => {
    try {
      const created = await machinesApi.create(body);
      await dispatch(fetchMachines());
      return created;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateMachine = createAppAsyncThunk(
  "machines/update",
  async (
    { id, changes }: { id: string; changes: UpdateMachineRequest },
    { rejectWithValue },
  ) => {
    try {
      return await machinesApi.update(id, changes);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteMachine = createAppAsyncThunk(
  "machines/delete",
  async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
      await machinesApi.remove(id);
      const { items, query } = getState().machines;
      if (items.length === 1 && query.page > 1) {
        dispatch(setPage(query.page - 1));
      } else {
        await dispatch(fetchMachines());
      }
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const machinesSlice = createSlice({
  name: "machines",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.query.page = action.payload;
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: MachineSortField; order: SortOrder }>,
    ) {
      state.query.sortBy = action.payload.sortBy;
      state.query.order = action.payload.order;
      state.query.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMachines.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchMachineOptions.fulfilled, (state, action) => {
        state.options = action.payload;
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export const { setPage, setSort } = machinesSlice.actions;
export default machinesSlice.reducer;
