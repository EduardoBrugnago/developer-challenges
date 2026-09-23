import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const EMAIL = __ENV.USER_EMAIL || "admin@dynamox.com";
const PASSWORD = __ENV.USER_PASSWORD || "dynamox123";

export const options = {
  scenarios: {
    steady: {
      executor: "ramping-vus",
      stages: [
        { duration: "15s", target: 20 },
        { duration: "30s", target: 20 },
        { duration: "10s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<350"],
    http_req_failed: ["rate<0.01"],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(res, { "login ok": (r) => r.status === 200 });
  return { token: res.json("accessToken") };
}

export default function (data) {
  const params = { headers: { Authorization: `Bearer ${data.token}` } };

  const machines = http.get(
    `${BASE_URL}/api/machines?page=1&limit=10&sortBy=name&order=asc`,
    params,
  );
  check(machines, { "machines 200": (r) => r.status === 200 });

  const points = http.get(
    `${BASE_URL}/api/monitoring-points?page=1&limit=5&sortBy=sensorModel&order=desc`,
    params,
  );
  check(points, { "points 200": (r) => r.status === 200 });

  const count = http.get(`${BASE_URL}/api/time-series/count`, params);
  check(count, { "count 200": (r) => r.status === 200 });

  sleep(1);
}
