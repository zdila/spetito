import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";

type Props = {
  owner: string;
  text: string;
  from: Date;
  to?: Date;
  audience?: string[];
};

export function Offer({ owner, from, to, text, audience }: Props) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {owner}｜{from.toLocaleDateString() + " " + from.toLocaleTimeString()}
        {to
          ? " - " + to.toLocaleDateString() + " " + to.toLocaleTimeString()
          : null}
        {audience ? (
          <>
            ｜
            {audience.map((item, i) => (
              <Fragment key={item}>
                {i > 0 ? ", " : null}
                {item}
              </Fragment>
            ))}
          </>
        ) : null}
      </Typography>

      <Box>
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Paper>
  );
}
