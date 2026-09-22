import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../../generic/theme/theme";
import { store } from "../store/store";
import { GlobalSnackbar } from "./GlobalSnackbar";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <GlobalSnackbar />
      </ThemeProvider>
    </Provider>
  );
}
