import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { DefaultUser } from "next-auth";
import { getSession, signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Layout } from "../components/Layout";
import { redirectToLogIn } from "../lib/auth";

type Props = { user: DefaultUser };

const Settings: NextPage<Props> = ({ user }) => {
  const { t } = useTranslation();

  function deleteAccount() {
    if (window.confirm(t("AreYouSure"))) {
      fetch("/api/users/_self_", { method: "DELETE" }).then(() => signOut());
    }
  }

  return (
    <Layout title={t("Settings")}>
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("Profile")}
      </Typography>

      <Paper
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {user.image && <Avatar src={user.image} />}

          <Typography>{user.name}</Typography>
        </Box>

        <LanguageSwitcher />

        <Button onClick={() => deleteAccount()} color="error">
          {t("DeleteAccount")}
        </Button>
      </Paper>
      {/* <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Notifications
      </Typography>

      <Paper sx={{ p: 2 }}></Paper> */}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const user = session?.user;

  if (!user) {
    return redirectToLogIn(context, "/settings");
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      user,
    },
  };
};

export default Settings;
