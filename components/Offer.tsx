import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Button, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Offer, User } from "@prisma/client";
import { Fragment, useCallback } from "react";

type OfferWirhAuthor = Offer & { author: User | null };

type Props = {
  offer: OfferWirhAuthor;
  onDelete?: () => void;
};

export function OfferItem({ offer, onDelete }: Props) {
  const { id, validFrom, validTo, message } = offer;

  const handleDeleteClick = useCallback(() => {
    fetch("/api/offers/" + id, { method: "DELETE" }).then(() => {
      onDelete?.();
    });
  }, [id, onDelete]);

  const audience: string[] = [];

  const onEdit = false; // TODO

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        {offer.author?.image && <Avatar src={offer.author?.image} />}

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {offer.author?.name ?? "nobody"}
            </Typography>

            <Typography variant="body2">
              {offer.createdAt.toLocaleDateString()}{" "}
              {validFrom || validTo ? "｜ Valid" : null}
              {validFrom
                ? "from " +
                  validFrom.toLocaleDateString() +
                  " " +
                  validFrom.toLocaleTimeString()
                : null}
              {validTo
                ? " to " +
                  validTo.toLocaleDateString() +
                  " " +
                  validTo.toLocaleTimeString()
                : null}
              {audience ? (
                <>
                  ｜
                  {audience.length === 0
                    ? "all your friends"
                    : audience.map((item, i) => (
                        <Fragment key={item}>
                          {i > 0 ? ", " : null}
                          {item}
                        </Fragment>
                      ))}
                </>
              ) : null}
            </Typography>
          </Box>
        </Box>

        {onDelete && (
          <IconButton
            aria-label="delete"
            title="Delete"
            edge="end"
            sx={{ alignSelf: "flex-start", mt: -1 }}
          >
            <EditIcon />
          </IconButton>
        )}

        {onEdit && (
          <IconButton
            aria-label="delete"
            title="Delete"
            color="error"
            edge="end"
            sx={{ alignSelf: "flex-start", mt: -1 }}
            onClick={handleDeleteClick}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Paper>
  );
}
