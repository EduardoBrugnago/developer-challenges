import type { AuthUser } from "@dynamoxtest/shared";

const KEY = "dynamoxtest.session";

export interface StoredSession {
  token: string;
  user: AuthUser;
}

export const tokenStorage = {
  load(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  },
  save(session: StoredSession) {
    localStorage.setItem(KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
