import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type {
  CreateMachineRequest,
  Machine,
  UpdateMachineRequest,
} from "@dynamoxtest/shared";
import { machinesApi } from "../../../services/machines/machinesApi";
import { getErrorMessage } from "../../../services/api/errors";
import { createAppAsyncThunk } from "../../../app/store/hooks";
import type { RootState } from "../../../app/store/store";

const machinesAdapter = createEntityAdapter<Machine>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

type Status = "idle" | "loading" | "succeeded" | "failed";

const initialState = machinesAdapter.getInitialState({
  status: "idle" as Status,
  error: null as string | null,
});

export const fetchMachines = createAppAsyncThunk(
  "machines/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await machinesApi.list();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createMachine = createAppAsyncThunk(
  "machines/create",
  async (body: CreateMachineRequest, { rejectWithValue }) => {
    try {
      return await machinesApi.create(body);
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
  async (id: string, { rejectWithValue }) => {
    try {
      return await machinesApi.remove(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const machinesSlice = createSlice({
  name: "machines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.status = "succeeded";
        machinesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to load machines";
      })
      .addCase(createMachine.fulfilled, (state, action) => {
        machinesAdapter.addOne(state, action.payload);
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        machinesAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteMachine.fulfilled, (state, action) => {
        machinesAdapter.removeOne(state, action.payload);
      });
  },
});

export const { selectAll: selectAllMachines, selectById: selectMachineById } =
  machinesAdapter.getSelectors((state: RootState) => state.machines);

export default machinesSlice.reducer;
