import { Typography } from "@mui/material";

export function Logo() {
  return (
    <Typography
      variant="h4"
      display="inline-block"
      component="span"
      sx={{
        mt: 2,
        mb: 1,
        backgroundColor: "#8000a0",
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
