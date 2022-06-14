import { grey, purple } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
    // MuiAppBar: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: "white",
    //       color: purple[800],
    //     },
    //   },
    // },
  },
  palette: {
    mode: "light",
    primary: {
      main: purple[800],
    },
    background: {
      default: grey[100],
    },
  },
});
