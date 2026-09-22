import { createSlice } from "@reduxjs/toolkit";
import type { AuthUser, LoginRequest } from "@dynamoxtest/shared";
import { authApi } from "../../../services/auth/authApi";
import { getErrorMessage } from "../../../services/api/errors";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { createAppAsyncThunk } from "../../../app/store/hooks";
import type { AppDispatch, RootState } from "../../../app/store/store";

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

// read saved session, then reload page and keeps user signedin.
function getInitialState(): AuthState {
  const session = tokenStorage.load();
  return {
    token: session?.token ?? null,
    user: session?.user ?? null,
    status: "idle",
    error: null,
  };
}

export const login = createAppAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      tokenStorage.save({ token: response.accessToken, user: response.user });
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState,
  reducers: {
    loggedOut: () => getInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { loggedOut } = authSlice.actions;

export const logout = () => (dispatch: AppDispatch) => {
  tokenStorage.clear();
  dispatch(loggedOut());
};

export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.token);

export default authSlice.reducer;
