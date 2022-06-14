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
} from "@mui/material";
import { List, ListMember, User } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useFriends } from "../hooks/useFriends";
import { useLists } from "../hooks/useLists";

export type ListWithMembers = List & {
  members: (ListMember & { user: User })[];
};

type Props = {
  onClose: (audience?: string[]) => void;
  open: boolean;
  audience: string[];
  friends?: User[];
  lists?: List[];
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

  const { t } = useTranslation();

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>{t("OfferAudience")}</DialogTitle>

      <DialogContent>
        <>
          <Typography variant="caption">{t("Friends")}</Typography>

          {!friends ? (
            <CircularProgress
              sx={{ display: "block", my: 1, marginX: "auto" }}
            />
          ) : friends.length === 0 ? (
            <Typography color="text.secondary" sx={{ my: 1 }}>
              {t("YouHaveNoFriends")}
            </Typography>
          ) : (
            <MuiList>
              {friends?.map((user) => {
                const key = "u:" + user.id;

                return (
                  <ListItem
                    key={key}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        onChange={() => checkListItem(key)}
                        checked={checked.indexOf(key) !== -1}
                      />
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => checkListItem(key)}>
                      {user.image && (
                        <ListItemAvatar>
                          <Avatar src={user.image} alt="" />
                        </ListItemAvatar>
                      )}

                      <ListItemText primary={user.name} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </MuiList>
          )}

          <Typography variant="caption">{t("Lists")}</Typography>

          {!lists ? (
            <CircularProgress
              sx={{ display: "block", my: 1, marginX: "auto" }}
            />
          ) : lists.length === 0 ? (
            <Typography sx={{ my: 1 }} color="text.secondary">
              {t("YouHaveNoLists")}
            </Typography>
          ) : (
            <MuiList>
              {lists?.map((list) => {
                const key = "l:" + list.id;

                return (
                  <ListItem
                    key={key}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        onChange={() => checkListItem(key)}
                        checked={checked.indexOf(key) !== -1}
                      />
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => checkListItem(key)}>
                      <ListItemText primary={list.name} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </MuiList>
          )}
        </>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(checked)}>{t("Save")}</Button>

        <Button onClick={() => onClose()} variant="text">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
