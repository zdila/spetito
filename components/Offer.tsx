import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Offer } from "@prisma/client";
import { Fragment, useCallback } from "react";

type Props = {
  offer: Offer;
  onDelete?: () => void;
};

export function OfferItem({ offer, onDelete }: Props) {
  const { id, validFrom, validTo, message } = offer;

  const handleDeleteClick = useCallback(() => {
    fetch("/api/offers/" + id, { method: "DELETE" }).then(() => {
      onDelete?.();
    });
  }, [id, onDelete]);

  const owner = "Martin"; // TODO

  const audience: string[] = [];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {owner}｜
        {validFrom
          ? validFrom.toLocaleDateString() +
            " " +
            validFrom.toLocaleTimeString()
          : null}
        {validTo
          ? " - " +
            validTo.toLocaleDateString() +
            " " +
            validTo.toLocaleTimeString()
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
        <Typography variant="body1">{message}</Typography>
      </Box>

      {onDelete && (
        <Button type="button" color="error" onClick={handleDeleteClick}>
          Delete
        </Button>
      )}
    </Paper>
  );
}
