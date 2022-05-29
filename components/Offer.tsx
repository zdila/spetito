import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Chip, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import { useCallback } from "react";

type OfferExt = Offer & {
  author: User | null;

  offerLists?: (OfferList & { list: List })[];
  offerUsers?: (OfferUser & { user: User })[];
};

type Props = {
  offer: OfferExt;
  onDelete?: () => void;
};

export function OfferItem({ offer, onDelete }: Props) {
  const { id, validFrom, validTo, message } = offer;

  const handleDeleteClick = useCallback(() => {
    fetch("/api/offers/" + id, { method: "DELETE" }).then(() => {
      onDelete?.();
    });
  }, [id, onDelete]);

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

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2">
                {offer.createdAt.toLocaleDateString()}{" "}
                {validFrom || validTo ? "｜ Valid" : null}
                {validFrom
                  ? " from " +
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
              </Typography>

              {offer.offerLists && offer.offerUsers ? (
                <>
                  ｜
                  {offer.offerLists.length + offer.offerUsers.length === 0 ? (
                    "all your friends"
                  ) : (
                    <>
                      {offer.offerLists.map((item) => (
                        <Chip key={item.listId} label={item.list.name} />
                      ))}
                      {offer.offerUsers.map((item) => (
                        <Chip
                          key={item.userId}
                          avatar={
                            item.user.image ? (
                              <Avatar src={item.user.image} />
                            ) : undefined
                          }
                          label={item.user.name}
                        />
                      ))}
                    </>
                  )}
                </>
              ) : null}
            </Box>
          </Box>
        </Box>

        {onEdit && (
          <IconButton
            aria-label="delete"
            title="Delete"
            edge="end"
            sx={{ alignSelf: "flex-start", mt: -1 }}
          >
            <EditIcon />
          </IconButton>
        )}

        {onDelete && (
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
