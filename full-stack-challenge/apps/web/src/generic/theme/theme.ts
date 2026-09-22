import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#006edb" },
    secondary: { main: "#ff9e3d" },
    background: { default: "#F3F3F3" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});
