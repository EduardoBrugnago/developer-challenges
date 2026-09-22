import {
  createSlice,
  isRejectedWithValue,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type Severity = "success" | "error" | "info" | "warning";

export interface Notification {
  id: number;
  message: string;
  severity: Severity;
}

interface NotificationsState {
  queue: Notification[];
}

const initialState: NotificationsState = { queue: [] };
let nextId = 1;

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notify: {
      reducer(state, action: PayloadAction<Notification>) {
        state.queue.push(action.payload);
      },
      prepare(payload: { message: string; severity?: Severity }) {
        return {
          payload: { id: nextId++, severity: "info" as Severity, ...payload },
        };
      },
    },
    dismiss(state, action: PayloadAction<number>) {
      state.queue = state.queue.filter((n) => n.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isRejectedWithValue, (state, action) => {
      if (action.type.startsWith("auth/")) return;
      state.queue.push({
        id: nextId++,
        severity: "error",
        message: String(action.payload),
      });
    });
  },
});

export const { notify, dismiss } = notificationsSlice.actions;
export default notificationsSlice.reducer;
