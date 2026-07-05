import { createTheme } from "@mui/material/styles";

// Theme clair facon NotebookLM (Material Design, palette Google-ish, cartes arrondies).
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a73e8" }, // Google blue
    background: { default: "#f8f9fa", paper: "#ffffff" },
    text: { primary: "#202124", secondary: "#5f6368" },
    divider: "#e0e0e0",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 20 } },
    },
    MuiAppBar: { defaultProps: { color: "default" } },
  },
});
