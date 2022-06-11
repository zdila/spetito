import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { List, User } from "@prisma/client";
import { SyntheticEvent, useRef, useState } from "react";
import { AudienceDialog } from "./AudienceDialog";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "next-i18next";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { OfferExt } from "../types";
import { MapDialog } from "./MapDialog";
import { useDelayedOff } from "../hooks/useDelayedOff";
import PlaceIcon from "@mui/icons-material/Place";
import { LngLat } from "maplibre-gl";

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

  const [validTo, setValidTo] = useState<Date | null>(null);

  const { locale = "en" } = useRouter();

  const mask = maskMap[locale];

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    fetch(offer ? "/api/offers/" + offer.id : "/api/offers", {
      method: offer ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message.trim(),
        validFrom: validFrom?.toISOString(),
        validTo: validTo?.toISOString(),
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
    }).then(() => {
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

  const [place, setPlace] = useState<
    | undefined
    | {
        center: LngLat;
        radius: number;
        zoom: number;
      }
  >(
    offer?.lat != null
      ? {
          center: new LngLat(offer.lng!, offer.lat!),
          zoom: offer.zoom!,
          radius: offer.radius!,
        }
      : undefined
  );

  const rootRef = useRef<HTMLFormElement | null>(null);

  const [focused, setFocused] = useState(false);

  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false);

  const tfRef = useRef<HTMLInputElement | null>(null);

  return (
    <Paper
      ref={rootRef}
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
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
          ? rootRef.current?.scrollHeight ?? 80
          : (tfRef.current?.scrollHeight ?? 50) + 32,
        ":focus-within": {
          height: rootRef.current?.scrollHeight,
        },
        overflow: "hidden",
        transition: "height 0.2s",
      }}
      component="form"
      onSubmit={handleSubmit}
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

      {mountMapDialog && (
        <MapDialog
          open={showMapDialog}
          value={place}
          onClose={(place) => {
            setPlace(place);

            setShowMapDialog(false);
          }}
        />
      )}

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
                  avatar={
                    friend?.image ? (
                      <Avatar src={friend.image} alt="" />
                    ) : undefined
                  }
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
              setPlace(undefined);
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
    </Paper>
  );
}
