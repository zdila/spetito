import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { SyntheticEvent, useState } from "react";

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
      <TextField
        label="Offer"
        fullWidth
        multiline
        sx={{ flexGrow: 1 }}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />

      <FormControl>
        <InputLabel id="demo-simple-select-label">Audience</InputLabel>

        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value="everyone"
          label="Audience"
          // onChange={handleChange}
        >
          <MenuItem value="everyone">Everyone</MenuItem>
        </Select>
      </FormControl>

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
          Add
        </Button>
      </Box>
    </Paper>
  );
}
