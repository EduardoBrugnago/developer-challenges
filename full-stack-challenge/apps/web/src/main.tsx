import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { store } from "./app/store";
import { router } from "./app/router";
import { theme } from "./theme";
import { registerUnauthorizedHandler } from "./api/httpClient";
import { logout } from "./features/auth/authSlice";
import { GlobalSnackbar } from "./components/GlobalSnackbar";

registerUnauthorizedHandler(() => store.dispatch(logout()));

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <GlobalSnackbar />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
