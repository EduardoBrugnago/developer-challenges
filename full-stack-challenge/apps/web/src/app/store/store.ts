import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, {
  loggedOut,
  logout,
} from "../../modules/auth/store/authSlice";
import machinesReducer from "../../modules/machines/store/machinesSlice";
import { registerUnauthorizedHandler } from "../../services/api/httpClient";
import notificationsReducer from "./notificationsSlice";

const appReducer = combineReducers({
  auth: authReducer,
  machines: machinesReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof appReducer>;

export const rootReducer: typeof appReducer = (state, action) =>
  appReducer(loggedOut.match(action) ? undefined : state, action);

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = setupStore();

registerUnauthorizedHandler(() => store.dispatch(logout()));

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
