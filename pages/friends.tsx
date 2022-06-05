import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  IconButton,
  Button,
  Paper,
  TextField,
  Typography,
  List,
  useEventCallback,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";
import { supportsPush } from "../lib/capabilities";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { redirectToLogIn } from "../lib/auth";

type Props = {
  usersInvitedByMe: User[];
  usersInvitingMe: User[];
  friends: User[];
};

const Friends: NextPage<Props> = ({
  usersInvitedByMe,
  usersInvitingMe,
  friends,
}) => {
  const [options, setOptions] = useState<readonly User[]>([]);

  const [inputValue, setInputValue] = useState("");

  const [value, setValue] = useState<User | null>(null);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setOptions([]);

      return;
    }

    const controller = new AbortController();

    (async () => {
      const res = await fetch(
        "/api/users?q=" +
          encodeURIComponent(inputValue.trim()) +
          "&filter=notFriendsAndNotPending",
        { signal: controller.signal }
      );

      const options: User[] = await res.json();

      setOptions(options);
    })();

    return () => controller.abort();
  }, [inputValue]);

  const router = useRouter();

  const refresh = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  const handleRequestClick = useEventCallback(() => {
    if (!value) {
      return;
    }

    fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: value?.id }),
    }).then(() => {
      setValue(null);

      setInputValue("");

      refresh();
    });
  });

  async function deleteRequest(id: string) {
    if (window.confirm(t("AreYouSure"))) {
      await fetch("/api/invites/" + encodeURIComponent(id), {
        method: "DELETE",
      });

      refresh();
    }
  }

  async function removeFriend(id: string) {
    if (window.confirm(t("AreYouSure"))) {
      await fetch("/api/follows/" + encodeURIComponent(id), {
        method: "DELETE",
      });

      refresh();
    }
  }

  async function accept(id: string) {
    await fetch("/api/invites/" + encodeURIComponent(id), {
      method: "POST",
    });

    refresh();
  }

  useEffect(() => {
    if (!supportsPush) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "refreshInvites" ||
        event.data.type === "refreshFriends"
      ) {
        refresh();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [refresh]);

  const { t } = useTranslation("common");

  return (
    <Layout title={t("Friends")}>
      {usersInvitingMe.length === 0 ? null : (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {t("FriendRequests")}
          </Typography>

          <Paper>
            <List>
              {usersInvitingMe.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <>
                      <IconButton
                        onClick={() => accept(user.id)}
                        title={t("AcceptFriendRequest")}
                      >
                        <CheckIcon />
                      </IconButton>

                      <IconButton
                        edge="end"
                        onClick={() => deleteRequest(user.id)}
                        title={t("RemoveFriendRequest")}
                      >
                        <ClearIcon />
                      </IconButton>
                    </>
                  }
                >
                  {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} alt="" />
                    </ListItemAvatar>
                  )}

                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("FindFriend")}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Autocomplete
          getOptionLabel={(option) => option.name ?? "-"}
          renderInput={(params) => (
            <TextField {...params} label={t("YourFriendsName")} fullWidth />
          )}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={options}
          autoComplete
          includeInputInList
          filterSelectedOptions
          renderOption={(props, option) => {
            return (
              <li key={option.id} {...props}>
                {option.image && (
                  <Avatar src={option.image} sx={{ mr: 1 }} alt="" />
                )}

                <Typography variant="body2" color="text.secondary">
                  {option.name ?? "-"}
                </Typography>
              </li>
            );
          }}
          value={value}
          onChange={(event, newValue: User | null) => {
            setValue(newValue);
          }}
        />

        <Button onClick={handleRequestClick} disabled={!value} sx={{ mt: 2 }}>
          {t("SendFriendRequest")}
        </Button>
      </Paper>

      {usersInvitedByMe.length === 0 ? null : (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {t("SentFriendRequests")}
          </Typography>

          <Paper>
            <List>
              {usersInvitedByMe.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => deleteRequest(user.id)}
                      title={t("Delete")}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} alt="" />
                    </ListItemAvatar>
                  )}

                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("YourFriends")}
      </Typography>

      {friends.length === 0 ? (
        <Typography color="text.secondary">{t("YouHaveNoFriends")}</Typography>
      ) : (
        <Paper>
          <List>
            {friends.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => removeFriend(user.id)}
                    color="error"
                    title={t("Unfriend")}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                {user.image && (
                  <ListItemAvatar>
                    <Avatar src={user.image} alt="" />
                  </ListItemAvatar>
                )}

                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const id = session?.user?.id;

  if (!id) {
    return redirectToLogIn(context, "/friends");
  }

  const usersInvitedByMe = await prisma.user.findMany({
    where: {
      invitedBy: {
        some: {
          inviterId: id,
        },
      },
    },
  });

  const usersInvitingMe = await prisma.user.findMany({
    where: {
      inviting: {
        some: {
          invitingId: id,
        },
      },
    },
  });

  const friends = await prisma.user.findMany({
    where: {
      OR: [
        {
          followedBy: {
            some: {
              followerId: id,
            },
          },
        },
        {
          following: {
            some: {
              followingId: id,
            },
          },
        },
      ],
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      usersInvitedByMe,
      usersInvitingMe,
      friends,
    },
  };
};

export default Friends;
