import { Paper, TextField, Typography } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { SyntheticEvent } from "react";
import { Layout } from "../components/Layout";
import { redirectToLogIn } from "../lib/auth";

type Props = {};

const Settings: NextPage<Props> = () => {
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

      <Paper sx={{ p: 2 }}>
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

  const id = session?.user?.id;

  if (!id) {
    return redirectToLogIn(context, "/settings");
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
    },
  };
};

export default Settings;
