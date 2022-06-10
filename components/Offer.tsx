import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Avatar, Chip, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { OfferForm } from "./OfferForm";
import { OfferExt } from "../types";
import PlaceIcon from "@mui/icons-material/Place";
import { useDelayedOff } from "../hooks/useDelayedOff";
import { MapDialog } from "./MapDialog";
import { LngLat } from "maplibre-gl";
import { useSession } from "next-auth/react";

type Props = {
  own?: boolean;
  offer: OfferExt;
  onDelete: () => void;
  friends?: User[];
  lists?: List[];
  now?: Date;
  timeZone?: string;
};

export function OfferItem({
  offer,
  onDelete,
  own = false,
  friends,
  lists,
  now,
  timeZone,
}: Props) {
  const { t } = useTranslation("common");

  const router = useRouter();

  const { locale } = router;

  const { id, validFrom, validTo, message } = offer;

  const handleDeleteClick = useCallback(() => {
    if (window.confirm(t("AreYouSure"))) {
      fetch("/api/offers/" + id, { method: "DELETE" }).then(() => {
        onDelete();
      });
    }
  }, [id, onDelete, t]);

  const [editing, setEditing] = useState(false);

  const [mapShown, setMapShown] = useState(false);

  const mountMapDialog = useDelayedOff(mapShown);

  return editing ? (
    <OfferForm
      friends={friends}
      lists={lists}
      now={now ?? new Date()}
      offer={offer}
      onCancel={() => setEditing(false)}
      onSaved={() => {
        setEditing(false);

        router.replace(router.asPath);
      }}
    />
  ) : (
    <Paper sx={{ p: 2 }}>
      {mountMapDialog && (
        <MapDialog
          readOnly
          open={mapShown}
          onClose={() => setMapShown(false)}
          value={
            offer.lng == null
              ? undefined
              : {
                  center: new LngLat(offer.lng!, offer.lat!),
                  zoom: offer.zoom!,
                  radius: offer.radius!,
                }
          }
        />
      )}

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
                {/* {(
                  offer.createdAt.toLocaleDateString(locale, { timeZone }) +
                  " " +
                  offer.createdAt.toLocaleTimeString(locale, {
                    timeStyle: "short",
                    timeZone,
                  })
                ).replaceAll(" ", "\xa0")}{" "} */}
                {validFrom || validTo ? "🗓" : null}
                {validFrom
                  ? " " +
                    t("dateFrom") +
                    " " +
                    (
                      validFrom.toLocaleDateString(locale, { timeZone }) +
                      " " +
                      validFrom.toLocaleTimeString(locale, {
                        timeStyle: "short",
                        timeZone,
                      })
                    ).replaceAll(" ", "\xa0")
                  : null}
                {validTo
                  ? " " +
                    t("dateTo") +
                    " " +
                    (
                      validTo.toLocaleDateString(locale, { timeZone }) +
                      " " +
                      validTo.toLocaleTimeString(locale, {
                        timeStyle: "short",
                        timeZone,
                      })
                    ).replaceAll(" ", "\xa0")
                  : null}
                {offer.offerLists && offer.offerUsers ? (
                  <>
                    {validFrom || validTo ? "｜" : ""}
                    👤{" "}
                    {offer.offerLists.length + offer.offerUsers.length === 0 &&
                      t("allMyFriends")}
                  </>
                ) : null}

                {offer.lat != null && (
                  <IconButton size="small" onClick={() => setMapShown(true)}>
                    <PlaceIcon />
                  </IconButton>
                )}
              </Typography>

              <>
                {offer.offerLists?.map((item) => (
                  <Chip key={item.listId} label={item.list.name} />
                ))}

                {offer.offerUsers?.map((item) => (
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
            </Box>
          </Box>
        </Box>

        {own && (
          <IconButton
            title={t("Modify")}
            edge="end"
            sx={{ alignSelf: "flex-start", mt: -1 }}
            onClick={() => setEditing(true)}
          >
            <EditIcon />
          </IconButton>
        )}

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
