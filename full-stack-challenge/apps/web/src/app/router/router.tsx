import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { LoginPage } from "../../modules/auth/pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { MachinesPage } from "../../modules/machines/pages/MachinesPage";
import { MonitoringPointsPage } from "../../modules/monitoringPoints/pages/MonitoringPointsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/machines" replace /> },
          { path: "/machines", element: <MachinesPage /> },
          { path: "/monitoring-points", element: <MonitoringPointsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
