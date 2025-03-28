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
  Alert,
} from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";
import { supportsPush } from "../lib/capabilities";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { redirectToLogIn } from "../lib/auth";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";
import { UserAvatar } from "../components/UserAvatar";
import { useDebouncedCallback } from "use-debounce";
import { useAutoclearState } from "../hooks/useAutoclearState";
import { PublicUser } from "../types";

type Props = {
  usersInvitedByMe: PublicUser[];
  usersInvitingMe: PublicUser[];
  friends: PublicUser[];
};

const Friends: NextPage<Props> = ({
  usersInvitedByMe,
  usersInvitingMe,
  friends,
}) => {
  const [options, setOptions] = useState<readonly PublicUser[]>([]);

  const [nameFilter, setNameFilter] = useState("");

  const [user, setUser] = useState<PublicUser | null>(null);

  const router = useRouter();

  function compareUsers(a: PublicUser, b: PublicUser) {
    return (a.name ?? "").localeCompare(b.name ?? "", router.locale);
  }

  const handleFetchFail = useFetchFailHandler();

  const setNameFilterDebounced = useDebouncedCallback(
    useCallback((value: string) => {
      setNameFilter(value);
    }, []),
    1000
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nameFilter.trim().length < 3) {
      setOptions([]);

      return;
    }

    const controller = new AbortController();

    (async () => {
      setLoading(true);

      const res = await handleFetchFail(
        fetch(
          "/api/users?q=" +
            encodeURIComponent(nameFilter.trim()) +
            "&filter=notFriendsAndNotPending",
          { signal: controller.signal }
        )
      );

      setLoading(false);

      if (res) {
        setOptions(await res.json());
      }
    })();

    return () => controller.abort();
  }, [nameFilter, handleFetchFail]);

  const refresh = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  const handleRequestClick = useEventCallback(() => {
    if (!user) {
      return;
    }

    handleFetchFail(
      fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })
    ).then((res) => {
      if (res) {
        setUser(null);

        setNameFilter("");

        refresh();
      }
    });
  });

  async function deleteRequest(id: string) {
    if (window.confirm(t("AreYouSure"))) {
      const res = await handleFetchFail(
        fetch("/api/invites/" + encodeURIComponent(id), {
          method: "DELETE",
        })
      );

      if (res) {
        refresh();
      }
    }
  }

  async function removeFriend(id: string) {
    if (window.confirm(t("AreYouSure"))) {
      const res = await handleFetchFail(
        fetch("/api/follows/" + encodeURIComponent(id), {
          method: "DELETE",
        })
      );

      if (res) {
        refresh();
      }
    }
  }

  async function accept(id: string) {
    const res = await handleFetchFail(
      fetch("/api/invites/" + encodeURIComponent(id), {
        method: "POST",
      })
    );

    if (res) {
      refresh();
    }
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

  const session = useSession();

  const [, rerender] = useReducer((state) => state + 1, 0);

  function handleFewFriendsAlertOkClick() {
    handleFetchFail(
      fetch("/api/users/_self_", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hideFewFriendsAlert: true }),
      })
    ).then((res) => {
      if (res) {
        // little hacky; see also https://github.com/nextauthjs/next-auth/discussions/2267
        window._spetito_hideFewFriendsAlert = true;

        rerender();
      }
    });
  }

  const highlightUserId = useAutoclearState(router.query["highlight-user"]);

  const [open, setOpen] = useState(false);

  return (
    <Layout title={t("Friends")}>
      {usersInvitingMe.length === 0 ? null : (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {t("FriendRequests")}
          </Typography>

          <Paper>
            <List>
              {[...usersInvitingMe].sort(compareUsers).map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    transition: "background-color 5s",
                    backgroundColor:
                      highlightUserId === user.id
                        ? "highlightItem.main"
                        : undefined,
                  }}
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
                  <ListItemAvatar>
                    <UserAvatar user={user} />
                  </ListItemAvatar>

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

      <Paper
        sx={{ p: 2 }}
        component="form"
        onSubmit={(e: SyntheticEvent) => {
          e.preventDefault();
          setNameFilterDebounced.flush();
        }}
      >
        {session.status === "authenticated" &&
          !session.data?.user?.hideFewFriendsAlert &&
          (typeof window === "undefined" ||
            !window._spetito_hideFewFriendsAlert) && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="text"
                  onClick={handleFewFriendsAlertOkClick}
                >
                  {t("OK")}
                </Button>
              }
            >
              {t("FewFriendsAlert")}
            </Alert>
          )}

        <Autocomplete
          openText={t("open")}
          clearText={t("clear")}
          noOptionsText={t("noResults")}
          loadingText={t("Loading")}
          getOptionLabel={(option) => option.name ?? "-"}
          forcePopupIcon={false}
          open={nameFilter.length < 3 ? false : open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          loading={loading}
          renderInput={(params) => (
            <TextField {...params} label={t("YourFriendsName")} fullWidth />
          )}
          onInputChange={(event, newInputValue) => {
            setNameFilterDebounced(newInputValue);
          }}
          options={[...options].sort(compareUsers)}
          autoComplete
          includeInputInList
          filterSelectedOptions
          renderOption={(props, option) => {
            return (
              <li key={option.id} {...props}>
                <UserAvatar user={option} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {option.name ?? "-"}
                </Typography>
              </li>
            );
          }}
          value={user}
          onChange={(event, user: PublicUser | null) => {
            setUser(user);
          }}
        />

        <Button
          onClick={handleRequestClick}
          disabled={!user}
          type="button"
          sx={{ mt: 2 }}
        >
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
              {[...usersInvitedByMe].sort(compareUsers).map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    transition: "background-color 5s",
                    backgroundColor:
                      highlightUserId === user.id
                        ? "highlightItem.main"
                        : undefined,
                  }}
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
                  <ListItemAvatar>
                    <UserAvatar user={user} />
                  </ListItemAvatar>

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
            {[...friends].sort(compareUsers).map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  transition: "background-color 5s",
                  backgroundColor:
                    highlightUserId === user.id
                      ? "highlightItem.main"
                      : undefined,
                }}
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
                    <UserAvatar user={user} />
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
    select: {
      id: true,
      name: true,
      image: true,
    },
    where: {
      invitedBy: {
        some: {
          inviterId: id,
        },
      },
    },
  });

  const usersInvitingMe = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
    where: {
      inviting: {
        some: {
          invitingId: id,
        },
      },
    },
  });

  const friends = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
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
