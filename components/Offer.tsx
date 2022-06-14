import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Avatar, Chip, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { List, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { OfferForm } from "./OfferForm";
import { OfferExt } from "../types";
import PlaceIcon from "@mui/icons-material/Place";
import { useDelayedOff } from "../hooks/useDelayedOff";
import { MapDialog } from "./MapDialog";
import { LngLat } from "maplibre-gl";
import { formatDateTime } from "../utility/formatDateTime";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";
import { grey } from "@mui/material/colors";

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

  const handleFetchFail = useFetchFailHandler();

  const handleDeleteClick = useCallback(() => {
    if (window.confirm(t("AreYouSure"))) {
      handleFetchFail(fetch("/api/offers/" + id, { method: "DELETE" })).then(
        (res) => {
          if (res) {
            onDelete();
          }
        }
      );
    }
  }, [id, onDelete, t, handleFetchFail]);

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
    <Paper
      sx={{
        p: 2,
        backgroundColor:
          offer.validTo && now && offer.validTo.getTime() < now?.getTime()
            ? grey[300]
            : undefined,
      }}
    >
      {mountMapDialog && (
        <MapDialog
          readOnly
          open={mapShown}
          onClose={() => setMapShown(false)}
          value={
            offer.lng == null
              ? null
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
                {/* {formatDateTime(createdAt, locale, timeZone)}{" "} */}
                {validFrom || validTo ? "🗓" : null}
                {validFrom ? (
                  <>
                    {" " + t("dateFrom") + " "}
                    <Box
                      component="span"
                      sx={
                        now && validFrom.getTime() < now.getTime()
                          ? { color: "error.dark" }
                          : {}
                      }
                    >
                      {formatDateTime(validFrom, locale, timeZone)}
                    </Box>
                  </>
                ) : null}
                {validTo ? (
                  <>
                    {" " + t("dateTo") + " "}
                    <Box
                      component="span"
                      sx={
                        now && validTo.getTime() < now.getTime()
                          ? { color: "error.dark" }
                          : {}
                      }
                    >
                      {formatDateTime(validTo, locale, timeZone)}
                    </Box>
                  </>
                ) : null}
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
