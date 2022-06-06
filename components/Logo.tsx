import { Typography } from "@mui/material";
import { purple } from "@mui/material/colors";

export function Logo() {
  return (
    <Typography
      variant="h4"
      display="inline-block"
      component="span"
      sx={{
        backgroundColor: purple[800],
        px: 1,
        color: "white",
        fontWeight: "bold",
        borderRadius: 1,
      }}
    >
      Offerbook
    </Typography>
  );
}
