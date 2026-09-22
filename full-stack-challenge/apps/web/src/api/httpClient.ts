import axios from "axios";
import { tokenStorage } from "./tokenStorage";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  const session = tokenStorage.load();
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
