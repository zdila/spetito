import { Box, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";

export function About() {
  const { t } = useTranslation("common");

  return (
    <Box>
      <Box component="section" sx={{ my: 2 }}>
        <Typography variant="h5">About</Typography>
        <Typography>Usecase/examples...</Typography>
      </Box>

      <Box component="section" sx={{ my: 2 }}>
        <Typography variant="h5">Why not Facebook?</Typography>

        <Typography>...</Typography>
      </Box>

      <Box component="section" sx={{ my: 2 }}>
        <Typography variant="h5">
          Why no likes, comments or chat? How to contact offering person?
        </Typography>

        <Typography>...</Typography>
      </Box>
    </Box>
  );
}
