import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "@dynamoxtest/shared";
import { http } from "../api/httpClient";

export const authApi = {
  login: (body: LoginRequest) =>
    http.post<LoginResponse>("/auth/login", body).then((r) => r.data),
  me: () => http.get<AuthUser>("/auth/me").then((r) => r.data),
};
