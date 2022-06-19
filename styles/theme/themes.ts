import { deepPurple, brown, grey, purple, yellow } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: purple[800],
    },
    background: {
      default: grey[200],
    },
    oldOffer: {
      main: grey[300],
    },
    highlightItem: {
      main: yellow[200],
    },
  },
});

export const darkTheme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: deepPurple[200],
    },
    background: {
      // default: grey[800],
    },
    oldOffer: {
      main: grey[900],
    },
    highlightItem: {
      main: brown[700],
    },
  },
});
