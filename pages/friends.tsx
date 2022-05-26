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
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";

type Props = {
  usersInvitedByMe: User[];
  usersInvitingMe: User[];
};

const Friends: NextPage<Props> = ({ usersInvitedByMe, usersInvitingMe }) => {
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
        "/api/users?q=" + encodeURIComponent(inputValue.trim()) + "&notInvited",
        { signal: controller.signal }
      );

      const options: User[] = await res.json();

      setOptions(options);
    })();

    return () => controller.abort();
  }, [inputValue]);

  const router = useRouter();

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

      router.replace(router.asPath);
    });
  });

  function deleteRequest(id: string) {
    fetch("/api/invites/" + encodeURIComponent(id), {
      method: "DELETE",
    }).then(() => {
      router.replace(router.asPath);
    });
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === "refreshInvites") {
        router.replace(router.asPath);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  });

  return (
    <Layout title="Friends">
      {usersInvitingMe.length === 0 ? null : (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Friend requests
          </Typography>

          <Paper>
            <List>
              {usersInvitingMe.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <>
                      <IconButton
                        aria-label="accept"
                        // onClick={() => deleteRequest(user.id)}
                        title="Accept friend request"
                      >
                        <CheckIcon />
                      </IconButton>

                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => deleteRequest(user.id)}
                        title="Remove friend request"
                      >
                        <ClearIcon />
                      </IconButton>
                    </>
                  }
                >
                  {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} />
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
        Find a friend
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Autocomplete
          getOptionLabel={(option) => option.name ?? "-"}
          renderInput={(params) => (
            <TextField {...params} label="Your friend's name" fullWidth />
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
          Send friend request
        </Button>
      </Paper>

      {usersInvitedByMe.length === 0 ? null : (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Sent friend requests
          </Typography>

          <Paper>
            <List>
              {usersInvitedByMe.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteRequest(user.id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} />
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
        Your friends
      </Typography>

      <Paper sx={{ p: 2 }}>TODO</Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const id = session?.user?.id;

  if (!id) {
    return {
      redirect: {
        destination: "/api/auth/signin?callbackUrl=/friends",
        permanent: false,
      },
    };
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

  return {
    props: {
      usersInvitedByMe,
      usersInvitingMe,
    },
  };
};

export default Friends;
