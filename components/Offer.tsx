import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
    closeMenu();

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
    closeMenu();

    import("../lib/icalExport").then(({ exportCalendarEvent }) => {
      exportCalendarEvent(t("OfferCalSummary"), offer);
    });
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleMenuButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
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
        position: "relative",
        p: 2,
        backgroundColor:
          offer.validTo && now && offer.validTo.getTime() < now?.getTime()
            ? grey[300]
            : undefined,
      }}
    >
      <IconButton
        size="small"
        sx={{ position: "absolute", right: 0, top: "0.25rem" }}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleMenuButtonClick}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {own && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setEditing(true);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>{t("Modify")}</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            {own ? (
              <DeleteIcon fontSize="small" />
            ) : (
              <CloseIcon fontSize="small" />
            )}
          </ListItemIcon>

          <ListItemText>{own ? t("Delete") : t("Hide")}</ListItemText>
        </MenuItem>

        {(validFrom || validTo) && (
          <MenuItem onClick={handleCalendarClick}>
            <ListItemIcon>
              <CalendarTodayIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>{t("SaveToCalendar")}</ListItemText>
          </MenuItem>
        )}
      </Menu>

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
          )}

          {offer.offerLists && offer.offerUsers && (
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
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

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
      </Box>

      <Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Paper>
  );
}
