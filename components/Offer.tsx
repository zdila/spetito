import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Avatar, Chip, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useCallback } from "react";
import { useRouter } from "next/router";

type OfferExt = Offer & {
  author: User | null;

  offerLists?: (OfferList & { list: List })[];
  offerUsers?: (OfferUser & { user: User })[];
};

type Props = {
  own?: boolean;
  offer: OfferExt;
  onDelete: () => void;
};

export function OfferItem({ offer, onDelete, own = false }: Props) {
  const { t } = useTranslation("common");

  const { locale } = useRouter();

  const { id, validFrom, validTo, message } = offer;

  const handleDeleteClick = useCallback(() => {
    if (window.confirm(t("AreYouSure"))) {
      fetch("/api/offers/" + id, { method: "DELETE" }).then(() => {
        onDelete();
      });
    }
  }, [id, onDelete, t]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        {offer.author?.image && <Avatar src={offer.author?.image} alt="" />}

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
                {offer.createdAt.toLocaleDateString(locale) +
                  " " +
                  offer.createdAt.toLocaleTimeString(locale, {
                    timeStyle: "short",
                  })}{" "}
                {validFrom || validTo ? "｜ " + t("Valid") : null}
                {validFrom
                  ? " " +
                    t("dateFrom") +
                    " " +
                    validFrom.toLocaleDateString(locale) +
                    " " +
                    validFrom.toLocaleTimeString(locale, { timeStyle: "short" })
                  : null}
                {validTo
                  ? " " +
                    t("dateTo") +
                    " " +
                    validTo.toLocaleDateString(locale) +
                    " " +
                    validTo.toLocaleTimeString(locale, { timeStyle: "short" })
                  : null}
              </Typography>

              {offer.offerLists && offer.offerUsers ? (
                <>
                  ｜
                  {offer.offerLists.length + offer.offerUsers.length === 0 ? (
                    t("allMyFriends")
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
                              <Avatar src={item.user.image} alt="" />
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

        {/* TODO {own && (
          <IconButton
            title={t("Edit")}
            edge="end"
            sx={{ alignSelf: "flex-start", mt: -1 }}
          >
            <EditIcon />
          </IconButton>
        )} */}

        <IconButton
          title={own ? t("Delete") : t("Hide")}
          color="error"
          edge="end"
          sx={{ alignSelf: "flex-start", mt: -1 }}
          onClick={handleDeleteClick}
        >
          {own ? <DeleteIcon /> : <CloseIcon />}
        </IconButton>
      </Box>

      <Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Paper>
  );
}
