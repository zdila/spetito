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
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import { List, ListMember, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useFriends } from "../hooks/useFriends";

export type ListWithMembers = List & {
  members: (ListMember & { user: User })[];
};

type Props = {
  onClose: (saved: boolean) => void;
  open: boolean;
  list: ListWithMembers;
};

export function ListManageDialog({ open, onClose, list }: Props) {
  const { t } = useTranslation("common");

  const [name, setName] = useState<string>(list.name);

  const friends = useFriends(open);

  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(list.name);

      setChecked(list.members.map((user) => user.userId));
    }
  }, [open, list]);

  const checkListItem = (id: string) => {
    setChecked((oldChecked) =>
      oldChecked.includes(id)
        ? oldChecked.filter((oldId) => oldId !== id)
        : [...oldChecked, id]
    );
  };

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
      <DialogTitle>{t("List_name_", { name: list.name })}</DialogTitle>

      <DialogContent>
        <TextField
          sx={{ mt: 1, mb: 2 }}
          label={t("ListName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <Typography variant="caption">{t("FriendsInTheList")}</Typography>

        {!friends ? (
          <CircularProgress sx={{ display: "block", my: 1, marginX: "auto" }} />
        ) : friends.length === 0 ? (
          <Typography color="text.secondary">
            {t("YouHaveNoFriends")}
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
                      <Avatar src={user.image} alt="" />
                    </ListItemAvatar>
                  )}

                  <ListItemText primary={user.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </MuiList>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSave}>{t("Save")}</Button>

        <Button onClick={() => onClose(false)}>{t("Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}
