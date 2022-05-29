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

type Props = {
  friends?: User[];
  lists?: List[];
  onCreate?: () => void;
};

export function NewOffer({ onCreate, friends, lists }: Props) {
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
      }),
    }).then(() => {
      setMessage("");

      setValidFrom("");

      setValidTo("");

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
        label="Offer"
        fullWidth
        multiline
        maxRows={6}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />

      <Box
        sx={{ width: "100%", display: "flex", gap: 1, alignItems: "center" }}
      >
        <Typography>Audience:</Typography>

        {audience.length === 0 ? (
          <Typography>all my friends</Typography>
        ) : (
          audience.map((item) => {
            const friend = friends?.find((frined) => frined.id === item);

            const list = friend
              ? undefined
              : lists?.find((list) => list.id === item);

            return friend || list ? (
              <Chip
                key={item}
                avatar={
                  friend?.image ? <Avatar src={friend.image} /> : undefined
                }
                label={list?.name ?? friend?.name ?? "?"}
              />
            ) : null;
          })
        )}

        <IconButton
          sx={{ my: -1 }}
          onClick={() => setShowAudienceDialog(true)}
          title="Set audience"
        >
          <EditIcon />
        </IconButton>
      </Box>

      <TextField
        label="From"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setValidFrom(e.currentTarget.value)}
        value={validFrom}
      />

      <TextField
        label="To"
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
          Place this offer
        </Button>
      </Box>
    </Paper>
  );
}
