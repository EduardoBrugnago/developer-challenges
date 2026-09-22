import { vi } from "vitest";
import { setupStore } from "../../app/store";
import { authApi } from "../../api/authApi";
import { tokenStorage } from "../../api/tokenStorage";
import { login, logout } from "./authSlice";

vi.mock("../../api/authApi", () => ({
  authApi: { login: vi.fn(), me: vi.fn() },
}));

describe("auth", () => {
  it("stores the session on successful login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "tkn",
      user: { id: "1", email: "a@b.com" },
    });
    const store = setupStore();

    await store.dispatch(login({ email: "a@b.com", password: "x" }));

    expect(store.getState().auth).toMatchObject({
      token: "tkn",
      status: "idle",
      error: null,
    });
    expect(tokenStorage.load()?.token).toBe("tkn");
  });

  it("exposes the error message on failed login", async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new Error("Invalid email or password"),
    );
    const store = setupStore();

    await store.dispatch(login({ email: "a@b.com", password: "wrong" }));

    expect(store.getState().auth).toMatchObject({
      token: null,
      status: "failed",
      error: "Invalid email or password",
    });
  });

  it("clears the session and the whole state on logout", async () => {
    tokenStorage.save({ token: "tkn", user: { id: "1", email: "a@b.com" } });
    const store = setupStore();
    expect(store.getState().auth.token).toBe("tkn");

    store.dispatch(logout());

    expect(store.getState().auth.token).toBeNull();
    expect(tokenStorage.load()).toBeNull();
  });
});
