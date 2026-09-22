import { combineReducers, configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "../features/notifications/notificationsSlice";

const appReducer = combineReducers({
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof appReducer>;

export const rootReducer: typeof appReducer = (state, action) =>
  appReducer(state, action);

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
