import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  IconButton,
  Button,
  Paper,
  TextField,
  Typography,
  List as MuiList,
  useEventCallback,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { List, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  open: boolean;
  list: List;
};

export function ListManageDialog({ open, onClose, list }: Props) {
  const [friends, setFriends] = useState<User[]>();

  useEffect(() => {
    if (open) {
      setFriends(undefined);

      const abortController = new AbortController();

      fetch("/api/users?filter=friends", { signal: abortController.signal })
        .then((response) => response.json())
        .then((data) => {
          setFriends(data);
        });

      return () => {
        abortController.abort();
      };
    }
  }, [open, list]);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Manage the list {list.name}</DialogTitle>

      <DialogContent>
        <TextField
          sx={{ mt: 1, mb: 2 }}
          label="List name"
          value={list.name}
          fullWidth
        />

        {!friends?.length ? (
          <Typography color="text.secondary">You have no friends 😞</Typography>
        ) : (
          <>
            <Typography variant="caption">Friends in the list</Typography>

            <MuiList>
              {friends?.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      // onChange={handleToggle(value)}
                      // checked={checked.indexOf(value) !== -1}
                      // inputProps={{ "aria-labelledby": labelId }}
                    />
                  }
                  disablePadding
                >
                  {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} />
                    </ListItemAvatar>
                  )}

                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </MuiList>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button>Save</Button>

        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
