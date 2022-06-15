import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Chip, Divider, IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { List, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { OfferForm } from "./OfferForm";
import { OfferExt } from "../types";
import PlaceIcon from "@mui/icons-material/Place";
import { useDelayedOff } from "../hooks/useDelayedOff";
import { LngLat } from "maplibre-gl";
import { formatDateTime } from "../utility/formatDateTime";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";
import { grey } from "@mui/material/colors";
import { useLazyMapDialog } from "../hooks/useLazyMapDialog";
import { UserAvatar } from "./UserAvatar";

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

  const MapDialog = useLazyMapDialog(mountMapDialog);

  const handleCalendarClick = () => {
    import("../lib/icalExport").then(({ exportCalendarEvent }) => {
      exportCalendarEvent(t("OfferCalSummary"), offer);
    });
  };

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
      {mountMapDialog && MapDialog && (
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
        {<UserAvatar user={offer.author} />}

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
              {offer.author.name ?? "nobody"}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {(validFrom || validTo) && (
                <IconButton
                  size="small"
                  onClick={handleCalendarClick}
                  edge="start"
                >
                  <CalendarTodayIcon />
                </IconButton>
              )}

              <Typography variant="body2">
                {/* {formatDateTime(createdAt, locale, timeZone)}{" "} */}
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
              </Typography>

              {offer.offerLists && offer.offerUsers ? (
                <>
                  {(validFrom || validTo) && (
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  )}
                  <Typography>
                    {offer.offerLists.length + offer.offerUsers.length === 0 &&
                      t("allMyFriends")}
                  </Typography>

                  {offer.offerLists?.map((item) => (
                    <Chip key={item.listId} label={item.list.name} />
                  ))}

                  {offer.offerUsers?.map((item) => (
                    <Chip
                      key={item.userId}
                      avatar={<UserAvatar user={item.user} />}
                      label={item.user.name}
                    />
                  ))}
                </>
              ) : null}

              {offer.lat != null && (
                <>
                  {(offer.validFrom ||
                    offer.validTo ||
                    (offer.offerLists && offer.offerUsers)) && (
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  )}

                  <IconButton
                    size="small"
                    onClick={() => setMapShown(true)}
                    edge="start"
                  >
                    <PlaceIcon />
                  </IconButton>
                </>
              )}
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
