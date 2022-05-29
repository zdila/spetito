import {
  Button,
  Typography,
  List as MuiList,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemButton,
  CircularProgress,
  Box,
} from "@mui/material";
import { List, ListMemeber, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFriends } from "../hooks/useFriends";
import { useLists } from "../hooks/useLists";

export type ListWithMembers = List & {
  members: (ListMemeber & { user: User })[];
};

type Props = {
  onClose: (audience?: string[]) => void;
  open: boolean;
  audience: string[];
};

export function AudienceDialog({ open, onClose, audience }: Props) {
  const friends = useFriends(open);

  const lists = useLists(open);

  const [checked, setChecked] = useState<string[]>(audience);

  useEffect(() => {
    if (open) {
      setChecked(audience);
    }
  }, [open, audience]);

  const checkListItem = (id: string) => {
    setChecked((oldChecked) =>
      oldChecked.includes(id)
        ? oldChecked.filter((oldId) => oldId !== id)
        : [...oldChecked, id]
    );
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Offer audience</DialogTitle>

      <DialogContent>
        <>
          <Typography variant="caption">Friends</Typography>

          {!friends ? (
            <CircularProgress
              sx={{ display: "block", my: 1, marginX: "auto" }}
            />
          ) : friends.length === 0 ? (
            <Typography color="text.secondary">
              You have no friends 😞
            </Typography>
          ) : (
            <MuiList>
              {friends?.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={() => checkListItem(user.id)}
                      checked={checked.indexOf(user.id) !== -1}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton onClick={() => checkListItem(user.id)}>
                    {user.image && (
                      <ListItemAvatar>
                        <Avatar src={user.image} />
                      </ListItemAvatar>
                    )}

                    <ListItemText primary={user.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </MuiList>
          )}

          <Typography variant="caption">Lists</Typography>

          {!lists ? (
            <CircularProgress
              sx={{ display: "block", my: 1, marginX: "auto" }}
            />
          ) : lists.length === 0 ? (
            <Typography sx={{ my: 1 }} color="text.secondary">
              You have no lists
            </Typography>
          ) : (
            <MuiList>
              {lists?.map((list) => (
                <ListItem
                  key={list.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={() => checkListItem(list.id)}
                      checked={checked.indexOf(list.id) !== -1}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton onClick={() => checkListItem(list.id)}>
                    <ListItemText primary={list.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </MuiList>
          )}
        </>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(checked)}>Save</Button>

        <Button onClick={() => onClose()}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
