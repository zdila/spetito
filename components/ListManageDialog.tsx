import {
  Button,
  TextField,
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
} from "@mui/material";
import { List, ListMemeber, User } from "@prisma/client";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";

export type ListWithMembers = List & {
  members: (ListMemeber & { user: User })[];
};

type Props = {
  onClose: (saved: boolean) => void;
  open: boolean;
  list: ListWithMembers;
};

export function ListManageDialog({ open, onClose, list }: Props) {
  const [name, setName] = useState<string>(list.name);

  const [friends, setFriends] = useState<User[]>();

  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(list.name);

      setFriends(undefined);

      const abortController = new AbortController();

      fetch("/api/users?filter=friends", { signal: abortController.signal })
        .then((response) => response.json())
        .then((data) => {
          setFriends(data);

          setChecked(list.members.map((member) => member.userId));
        });

      return () => {
        abortController.abort();
      };
    }
  }, [open, list]);

  const handleSave = () => {
    fetch(`/api/lists/${list.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, members: checked }),
    }).then(() => {
      onClose(true);
    });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>Manage the list {list.name}</DialogTitle>

      <DialogContent>
        <TextField
          sx={{ mt: 1, mb: 2 }}
          label="List name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
                      onChange={(e) => {
                        const { checked } = e.currentTarget;

                        setChecked((oldChecked) =>
                          checked
                            ? [...oldChecked, user.id]
                            : oldChecked.filter((id) => id !== user.id)
                        );
                      }}
                      checked={checked.indexOf(user.id) !== -1}
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
        <Button onClick={handleSave}>Save</Button>

        <Button onClick={() => onClose(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
