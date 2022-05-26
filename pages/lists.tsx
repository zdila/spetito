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
  Box,
} from "@mui/material";
import { Group, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";

type Props = {
  lists: Group[];
};

const Lists: NextPage<Props> = ({ lists }) => {
  const router = useRouter();

  async function deleteList(id: string) {
    await fetch("/api/lists/" + encodeURIComponent(id), {
      method: "DELETE",
    });

    router.replace(router.asPath);
  }

  const [name, setName] = useState("");

  async function handleCreateClick(e: SyntheticEvent) {
    e.preventDefault();

    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
      }),
    });

    setName("");

    router.replace(router.asPath);
  }

  return (
    <Layout title="Lists">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Create a list
      </Typography>

      <Paper sx={{ p: 2 }} component="form" onSubmit={handleCreateClick}>
        <TextField
          label="List name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          fullWidth
        />

        <Button type="submit" disabled={!name} sx={{ mt: 2 }}>
          Create
        </Button>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Your lists
      </Typography>

      <Paper>
        {lists.length === 0 ? (
          <Typography sx={{ p: 2 }}>You have no lists</Typography>
        ) : (
          <List>
            {lists.map((list) => (
              <ListItem
                key={list.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteList(list.id)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {/* {user.image && (
                    <ListItemAvatar>
                      <Avatar src={user.image} />
                    </ListItemAvatar>
                  )} */}

                <ListItemText primary={list.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
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
        destination: "/api/auth/signin?callbackUrl=/lists",
        permanent: false,
      },
    };
  }

  const lists = await prisma.group.findMany({
    where: {
      userId: id,
    },
    orderBy: { name: "asc" },
  });

  return {
    props: {
      lists,
    },
  };
};

export default Lists;
