import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { List, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
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
import { getUserAvatarProps, UserAvatar } from "./UserAvatar";

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

      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <UserAvatar
          user={offer.author}
          sx={{ alignSelf: "flex-start", mr: 1.5 }}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2">{offer.author.name ?? "???"}</Typography>

          {(validFrom || validTo) && (
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          )}

          {(validFrom || validTo) && (
            <Box
              sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
            >
              <IconButton
                size="small"
                onClick={handleCalendarClick}
                edge="start"
              >
                <CalendarTodayIcon fontSize="small" />
              </IconButton>

              <Typography variant="body2" component="span">
                {validFrom ? (
                  <>
                    {" " + t("dateFrom") + "\xa0"}
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
                    {" " + t("dateTo") + "\xa0"}
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
            </Box>
          )}

          {offer.offerLists && offer.offerUsers && (validFrom || validTo) && (
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          )}

          {offer.offerLists && offer.offerUsers ? (
            <Box
              sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="body2">
                {offer.offerLists.length + offer.offerUsers.length === 0 &&
                  t("allMyFriends")}
              </Typography>

              {offer.offerLists?.map((item) => (
                <Chip key={item.listId} label={item.list.name} />
              ))}

              {offer.offerUsers?.map((item) => (
                <Chip
                  key={item.userId}
                  avatar={<Avatar {...getUserAvatarProps(item.user)} />}
                  label={item.user.name}
                />
              ))}
            </Box>
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
                <PlaceIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        {own && (
          <IconButton
            title={t("Modify")}
            sx={{ alignSelf: "flex-start", mt: -1 }}
            onClick={() => setEditing(true)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          title={own ? t("Delete") : t("Hide")}
          color="error"
          edge="end"
          sx={{ alignSelf: "flex-start", mt: -1 }}
          onClick={handleDeleteClick}
          size="small"
        >
          {own ? (
            <DeleteIcon fontSize="small" />
          ) : (
            <CloseIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Paper>
  );
}
