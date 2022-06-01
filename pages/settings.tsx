import { Avatar, Box, Paper, Typography } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { DefaultUser } from "next-auth";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { SyntheticEvent } from "react";
import { Layout } from "../components/Layout";
import { redirectToLogIn } from "../lib/auth";

type Props = { user: DefaultUser };

const Settings: NextPage<Props> = ({ user }) => {
  const { t } = useTranslation("common");

  const handleLangClick = (e: SyntheticEvent<HTMLAnchorElement>) => {
    const { lang } = e.currentTarget.dataset;

    if (lang) {
      document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    }
  };

  return (
    <Layout title={t("Settings")}>
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("Profile")}
      </Typography>

      <Paper sx={{ p: 2, display: "flex", gap: 1, flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {user.image && <Avatar src={user.image} />}
          <Typography>{user.name}</Typography>
        </Box>

        <Typography>
          {t("Language")}:{" "}
          <Link href="/en/settings" locale="en" onClick={handleLangClick}>
            <a onClick={handleLangClick} data-lang="en">
              English
            </a>
          </Link>
          {", "}
          <Link href="/sk/settings" locale="sk">
            <a onClick={handleLangClick} data-lang="sk">
              Slovensky
            </a>
          </Link>
        </Typography>
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
