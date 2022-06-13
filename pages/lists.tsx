import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  Paper,
  TextField,
  Typography,
  List as MuiList,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Box,
  Alert,
} from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { prisma } from "../lib/prisma";
import {
  ListManageDialog,
  ListWithMembers,
} from "../components/ListManageDialog";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Trans, useTranslation } from "next-i18next";
import { redirectToLogIn } from "../lib/auth";
import { User } from "@prisma/client";
import { useDelayedOff } from "../hooks/useDelayedOff";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";

type Props = {
  lists: ListWithMembers[];
};

const Lists: NextPage<Props> = ({ lists }) => {
  const router = useRouter();

  const handleFetchFail = useFetchFailHandler();

  async function deleteList(id: string) {
    if (window.confirm(t("AreYouSure"))) {
      const res = await handleFetchFail(
        fetch("/api/lists/" + encodeURIComponent(id), {
          method: "DELETE",
        })
      );

      if (res) {
        router.replace(router.asPath);
      }
    }
  }

  const [name, setName] = useState("");

  async function handleCreateClick(e: SyntheticEvent) {
    e.preventDefault();

    const res = await handleFetchFail(
      fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
        }),
      })
    );

    if (res) {
      setName("");

      router.replace(router.asPath);
    }
  }

  const [expanded, setExpanded] = useState<string>();

  const [managing, setManaging] = useState(false);

  const mountListManageDialog = useDelayedOff(managing);

  const expandedList = lists.find((list) => list.id === expanded);

  const { t } = useTranslation("common");

  const { locale } = useRouter();

  function compareUsers(a: { user: User }, b: { user: User }) {
    return (a.user.name ?? "").localeCompare(b.user.name ?? "", locale);
  }

  return (
    <Layout title={t("Lists")}>
      {expandedList && mountListManageDialog && (
        <ListManageDialog
          open={managing}
          onClose={(refresh) => {
            setManaging(false);

            if (refresh) {
              router.replace(router.asPath);
            }
          }}
          list={expandedList}
        />
      )}

      {lists.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Trans t={t} i18nKey="ListInfoAlert">
            text <i>sample1</i>, <i>sample2</i>
          </Trans>
        </Alert>
      )}

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("CreateList")}
      </Typography>

      <Paper sx={{ p: 2 }} component="form" onSubmit={handleCreateClick}>
        <TextField
          label={t("ListName")}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          fullWidth
        />

        <Button type="submit" disabled={!name} sx={{ mt: 2 }}>
          {t("Create")}
        </Button>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("YourLists")}
      </Typography>

      {lists.length === 0 ? (
        <Typography color="text.secondary">{t("YouHaveNoLists")}</Typography>
      ) : (
        <Box>
          {[...lists]
            .sort((a, b) => a.name.localeCompare(b.name, locale))
            .map((list) => (
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
                  {list.members.length === 0 ? (
                    <Typography color="text.secondary">
                      {t("ListIsEmpty")}
                    </Typography>
                  ) : (
                    <MuiList disablePadding>
                      {[...list.members].sort(compareUsers).map((member) => (
                        <ListItem key={member.userId}>
                          {member.user.image && (
                            <ListItemAvatar>
                              <Avatar src={member.user.image} alt="" />
                            </ListItemAvatar>
                          )}

                          <ListItemText primary={member.user.name} />
                        </ListItem>
                      ))}
                    </MuiList>
                  )}
                </AccordionDetails>

                <AccordionActions>
                  <Button onClick={() => setManaging(true)}>
                    {t("Manage")}
                  </Button>

                  <Button color="error" onClick={() => deleteList(list.id)}>
                    {t("Delete")}
                  </Button>
                </AccordionActions>
              </Accordion>
            ))}
        </Box>
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
    return redirectToLogIn(context, "/lists");
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
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      lists,
    },
  };
};

export default Lists;
