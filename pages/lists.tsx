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
import { Group, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";

type Props = {
  lists: Group[];
};

const Lists: NextPage<Props> = ({ lists }) => {
  const router = useRouter();

  function deleteList(id: string) {
    fetch("/api/lists/" + encodeURIComponent(id), {
      method: "DELETE",
    }).then(() => {
      router.replace(router.asPath);
    });
  }

  return (
    <Layout title="Lists">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Lists
      </Typography>

      <Paper>
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
  });

  return {
    props: {
      lists,
    },
  };
};

export default Lists;
