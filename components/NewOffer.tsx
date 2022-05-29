import { Box, Button, Paper, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AudienceDialog } from "./AudienceDialog";

type Props = {
  onCreate?: () => void;
};

export function NewOffer({ onCreate }: Props) {
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
      />

      <TextField
        label="Offer"
        fullWidth
        multiline
        sx={{ flexGrow: 1 }}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />

      <Button variant="outlined" onClick={() => setShowAudienceDialog(true)}>
        Set audience
      </Button>

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
