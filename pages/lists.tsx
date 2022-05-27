import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  IconButton,
  Button,
  Paper,
  TextField,
  Typography,
  List as MuiList,
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
import { List, ListMemeber, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";
import { ListManageDialog } from "../components/ListManageDialog";

type ListExt = List & { members: (ListMemeber & { user: User })[] };

type Props = {
  lists: ListExt[];
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

  const [expanded, setExpanded] = useState<ListExt>();

  const [managing, setManaging] = useState(false);

  return (
    <Layout title="Lists">
      {expanded && (
        <ListManageDialog
          open={managing}
          onClose={() => setManaging(false)}
          list={expanded}
        />
      )}

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
            expanded={expanded === list}
            onChange={(event, isExpanded) =>
              setExpanded(isExpanded ? list : undefined)
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} id={list.id}>
              <Typography>{list.name}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              {!expanded ? null : expanded.members.length === 0 ? (
                <Typography color="text.secondary">
                  There are no friends in this list.
                </Typography>
              ) : (
                <MuiList>
                  {expanded.members.map((member) => (
                    <ListItem
                      key={member.userId}
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
                      {member.user.image && (
                        <ListItemAvatar>
                          <Avatar src={member.user.image} />
                        </ListItemAvatar>
                      )}

                      <ListItemText primary={member.user.name} />
                    </ListItem>
                  ))}
                </MuiList>
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

  const lists = await prisma.list.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
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
