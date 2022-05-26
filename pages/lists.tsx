import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
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

  const [expanded, setExpanded] = useState<string>();

  const [managing, setManaging] = useState(false);

  const [listNameToAddFriends, setListNameToAddFriends] = useState<string>();

  const [listFriends, setListFriends] = useState<User[]>();

  useEffect(() => {
    if (managing && expanded) {
      setListNameToAddFriends(lists.find((list) => list.id === expanded)?.name);
    }
  }, [managing, expanded, lists]);

  useEffect(() => {
    if (expanded) {
      setListFriends(undefined);

      fetch("/api/users?filter=friends&inList=" + encodeURIComponent(expanded))
        .then((response) => response.json())
        .then((data) => {
          setListFriends(data);
        });

      // TODO abort
    }
  }, [expanded]);

  return (
    <Layout title="Lists">
      <Dialog fullWidth open={managing} onClose={() => setManaging(false)}>
        <DialogTitle>Manage the list {listNameToAddFriends}</DialogTitle>

        <DialogContent>
          <TextField
            sx={{ mt: 1, mb: 2 }}
            label="List name"
            value={listNameToAddFriends}
            fullWidth
          />

          {!listFriends?.length ? (
            <Typography color="text.secondary">
              You have no friends 😞
            </Typography>
          ) : (
            <>
              <Typography variant="caption">Friends in the list</Typography>

              <List>
                {listFriends?.map((user) => (
                  <ListItem
                    key={user.id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        // onChange={handleToggle(value)}
                        // checked={checked.indexOf(value) !== -1}
                        // inputProps={{ "aria-labelledby": labelId }}
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
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button>Save</Button>

          <Button onClick={() => setManaging(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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

      {lists.length === 0 ? (
        <Typography color="text.secondary">You have no lists</Typography>
      ) : (
        lists.map((list) => (
          <Accordion
            key={list.id}
            expanded={expanded === list.id}
            onChange={(event, isExpanded) =>
              setExpanded(isExpanded ? list.id : undefined)
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} id={list.id}>
              <Typography>{list.name}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              {!listFriends ? (
                "Loading..."
              ) : listFriends.length === 0 ? (
                <Typography color="text.secondary">
                  There are no friends in this list.
                </Typography>
              ) : (
                <List>
                  {listFriends.map((user) => (
                    <ListItem
                      key={user.id}
                      // secondaryAction={
                      //   <>
                      //     <IconButton
                      //       aria-label="accept"
                      //       onClick={() => accept(user.id)}
                      //       title="Accept friend request"
                      //     >
                      //       <CheckIcon />
                      //     </IconButton>

                      //     <IconButton
                      //       edge="end"
                      //       aria-label="remove"
                      //       onClick={() => deleteRequest(user.id)}
                      //       title="Remove friend request"
                      //     >
                      //       <ClearIcon />
                      //     </IconButton>
                      //   </>
                      // }
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
              )}
            </AccordionDetails>

            <AccordionActions>
              <Button onClick={() => setManaging(true)}>Manage</Button>

              <Button color="error" onClick={() => deleteList(list.id)}>
                Delete
              </Button>
            </AccordionActions>
          </Accordion>
        ))
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
