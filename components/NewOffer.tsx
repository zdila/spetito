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
import { SyntheticEvent, useState } from "react";
import { AudienceDialog } from "./AudienceDialog";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "next-i18next";

type Props = {
  friends?: User[];
  lists?: List[];
  onCreate?: () => void;
};

export function NewOffer({ onCreate, friends, lists }: Props) {
  const { t } = useTranslation("common");

  const [message, setMessage] = useState("");

  const [validFrom, setValidFrom] = useState("");

  const [validTo, setValidTo] = useState("");

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message.trim(),
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validTo: validTo ? new Date(validTo).toISOString() : null,
        audience: {
          users: audience
            .filter((item) => item.startsWith("u:"))
            .map((item) => item.slice(2)),
          lists: audience
            .filter((item) => item.startsWith("l:"))
            .map((item) => item.slice(2)),
        },
      }),
    }).then(() => {
      setMessage("");

      setValidFrom("");

      setValidTo("");

      setAudience([]);

      onCreate?.();
    });
  };

  const [showAudienceDialog, setShowAudienceDialog] = useState(false);

  const [audience, setAudience] = useState<string[]>([]);

  const handleAudienceClose = (audience?: string[]) => {
    setShowAudienceDialog(false);

    if (audience) {
      setAudience(audience);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <AudienceDialog
        audience={audience}
        open={showAudienceDialog}
        onClose={handleAudienceClose}
        friends={friends}
        lists={lists}
      />

      <TextField
        label={t("Offer")}
        fullWidth
        multiline
        maxRows={6}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />

      <Box
        sx={{ width: "100%", display: "flex", gap: 1, alignItems: "center" }}
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

      <TextField
        label={t("DateFrom")}
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setValidFrom(e.currentTarget.value)}
        value={validFrom}
      />

      <TextField
        label={t("DateTo")}
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setValidTo(e.currentTarget.value)}
        value={validTo}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Button
          sx={{ marginLeft: "auto", display: "block", height: "100%" }}
          variant="contained"
          disabled={!message.trim()}
          type="submit"
        >
          {t("placeThisOffer")}
        </Button>
      </Box>
    </Paper>
  );
}
