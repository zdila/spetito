import {
  Autocomplete,
  Button,
  Paper,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";

type Props = {
  usersInvitedByMe: User[];
  usersInvitingMe: User[];
};

const Contacts: NextPage<Props> = ({ usersInvitedByMe, usersInvitingMe }) => {
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

  return (
    <Layout title="Contacts">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Search
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Autocomplete
          getOptionLabel={(option) => option.name ?? "-"}
          renderInput={(params) => (
            <TextField {...params} label="Find user" fullWidth />
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

        <Button onClick={handleRequestClick} disabled={!value}>
          Send friend request
        </Button>

        <ul>
          {usersInvitedByMe.map((user) => (
            <li key={user.id}>
              {user.name}

              <Button type="button" onClick={() => deleteRequest(user.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Invites
      </Typography>

      <Paper sx={{ p: 2 }}>
        <ul>
          {usersInvitingMe.map((user) => (
            <li key={user.id}>
              {user.name}

              <Button type="button" onClick={() => deleteRequest(user.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Groups
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>
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
        // destination: "/login",
        destination: "/api/auth/signin?callbackUrl=/",
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

export default Contacts;
