import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { List, User } from "@prisma/client";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { AudienceDialog } from "./AudienceDialog";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "next-i18next";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { OfferExt } from "../types";
import { useDelayedOff } from "../hooks/useDelayedOff";
import PlaceIcon from "@mui/icons-material/Place";
import { LngLat } from "maplibre-gl";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";
import { useLazyMapDialog } from "../hooks/useLazyMapDialog";
import { UserAvatar } from "./UserAvatar";

const maskMap: Record<string, string> = {
  en: "__/__/____ __:__ _M",
  sk: "__.__.____ __:__",
};

type Props = {
  friends?: User[];
  lists?: List[];
  now: Date;
  onSaved?: () => void;
  onCancel?: () => void;
  offer?: OfferExt; // if editing
};

export function OfferForm({
  onSaved,
  onCancel,
  friends,
  lists,
  now,
  offer,
}: Props) {
  const { t } = useTranslation("common");

  const [message, setMessage] = useState(offer?.message ?? "");

  const [validFrom, setValidFrom] = useState<Date | null>(
    offer?.validFrom ?? null
  );

  const [validTo, setValidTo] = useState<Date | null>(offer?.validTo ?? null);

  const { locale = "en" } = useRouter();

  const mask = maskMap[locale];

  const handleFetchFail = useFetchFailHandler();

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    handleFetchFail(
      fetch(offer ? "/api/offers/" + offer.id : "/api/offers", {
        method: offer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          validFrom: validFrom?.toISOString() ?? null,
          validTo: validTo?.toISOString() ?? null,
          audience: {
            users: audience
              .filter((item) => item.startsWith("u:"))
              .map((item) => item.slice(2)),
            lists: audience
              .filter((item) => item.startsWith("l:"))
              .map((item) => item.slice(2)),
          },
          place: place ?? null,
        }),
      })
    ).then((res) => {
      if (!res) {
        return;
      }

      setMessage("");

      setValidFrom(null);

      setValidTo(null);

      setAudience([]);

      onSaved?.();
    });
  };

  const [showAudienceDialog, setShowAudienceDialog] = useState(false);

  const mountAudienceDialog = useDelayedOff(showAudienceDialog);

  const [audience, setAudience] = useState<string[]>(() => [
    ...(offer?.offerLists?.map((item) => "l:" + item.listId) ?? []),
    ...(offer?.offerUsers?.map((item) => "u:" + item.userId) ?? []),
  ]);

  const handleAudienceClose = (audience?: string[]) => {
    setShowAudienceDialog(false);

    if (audience) {
      setAudience(audience);
    }
  };

  const [showMapDialog, setShowMapDialog] = useState(false);

  const mountMapDialog = useDelayedOff(showMapDialog);

  const MapDialog = useLazyMapDialog(mountMapDialog);

  const [place, setPlace] = useState<null | {
    center: LngLat;
    radius: number;
    zoom: number;
  }>(
    offer?.lat != null
      ? {
          center: new LngLat(offer.lng!, offer.lat!),
          zoom: offer.zoom!,
          radius: offer.radius!,
        }
      : null
  );

  const contentRef = useRef<HTMLFormElement | null>(null);

  const [focused, setFocused] = useState(false);

  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false);

  const tfRef = useRef<HTMLInputElement | null>(null);

  const [contentHeight, setContentHeight] = useState(
    contentRef.current?.clientHeight
  );

  useEffect(() => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    // setContentHeight(container.clientHeight);

    const observer = new ResizeObserver(() => {
      setContentHeight(container.clientHeight);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Paper
      sx={{
        height: offer
          ? undefined
          : message.trim() ||
            focused ||
            showAudienceDialog ||
            showMapDialog ||
            dateTimePickerOpen ||
            place ||
            audience.length > 0 ||
            validFrom ||
            validTo
          ? contentHeight
          : (tfRef.current?.scrollHeight ?? 50) + 32,
        ":focus-within": {
          height: contentHeight,
        },
        overflow: "hidden",
        transition: "height 0.2s",
      }}
    >
      {mountAudienceDialog && (
        <AudienceDialog
          audience={audience}
          open={showAudienceDialog}
          onClose={handleAudienceClose}
          friends={friends}
          lists={lists}
        />
      )}

      {mountMapDialog && MapDialog && (
        <MapDialog
          open={showMapDialog}
          value={place}
          onClose={(place) => {
            if (place !== undefined) {
              setPlace(place);
            }

            setShowMapDialog(false);
          }}
        />
      )}

      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
        ref={contentRef}
        component="form"
        onSubmit={handleSubmit}
      >
        <TextField
          label={t("Offer")}
          fullWidth
          multiline
          maxRows={6}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          ref={tfRef}
          autoFocus={!!offer}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            rowGap: 2,
            columnGap: 1,
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              columnGap: 1,
              rowGap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography>{t("Time")}</Typography>

            <DateTimePicker
              label={t("DateFrom")}
              renderInput={(props) => (
                <TextField {...props} inputProps={{ ...props.inputProps }} />
              )}
              onChange={(value) => setValidFrom(value)}
              value={validFrom}
              mask={mask}
              ampm={locale === "en"}
              minDateTime={now}
              maxDateTime={validTo}
              onOpen={() => setDateTimePickerOpen(true)}
              onClose={() => setDateTimePickerOpen(false)}
            />

            <DateTimePicker
              label={t("DateTo")}
              renderInput={(props) => (
                <TextField {...props} inputProps={{ ...props.inputProps }} />
              )}
              onChange={(value) => setValidTo(value)}
              value={validTo}
              mask={mask}
              ampm={locale === "en"}
              minDateTime={validFrom || now}
              onOpen={() => setDateTimePickerOpen(true)}
              onClose={() => setDateTimePickerOpen(false)}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography>{t("Audience")}:</Typography>

            {audience.length === 0 ? (
              <Typography>{t("allMyFriends")}</Typography>
            ) : (
              audience.map((item) => {
                const id = item.slice(2);

                const friend = item.startsWith("u:")
                  ? friends?.find((frined) => frined.id === id)
                  : undefined;

                const list = item.startsWith("l:")
                  ? lists?.find((list) => list.id === id)
                  : undefined;

                return friend || list ? (
                  <Chip
                    key={item}
                    avatar={friend && <UserAvatar user={friend} />}
                    label={list?.name ?? friend?.name ?? "?"}
                  />
                ) : null;
              })
            )}

            <IconButton
              sx={{ my: -1 }}
              onClick={() => setShowAudienceDialog(true)}
              title={t("SetAudience")}
            >
              <EditIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography>{t("Place")}:</Typography>

            <Typography>{place ? t("placeSet") : t("placeNotSet")}</Typography>

            <IconButton onClick={() => setShowMapDialog(true)}>
              <PlaceIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexGrow: 1,
              alignSelf: "flex-end",
            }}
          >
            <Button disabled={!message.trim()} type="submit">
              {t(offer ? "Save" : "PlaceThisOffer")}
            </Button>

            <Button
              variant="text"
              onClick={(e) => {
                setMessage("");
                setPlace(null);
                setValidFrom(null);
                setValidTo(null);
                setAudience([]);

                onCancel?.();

                e.currentTarget.blur();
              }}
              disabled={
                !(
                  offer ||
                  message.trim() ||
                  place ||
                  validFrom ||
                  validTo ||
                  audience.length > 0
                )
              }
            >
              {t("Cancel")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
