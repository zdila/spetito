import { Paper, TextField, Typography } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Layout } from "../components/Layout";

type Props = {};

const Settings: NextPage<Props> = () => {
  // useEffect(() => {
  //   document.cookie = "NEXT_LOCALE=sk; path=/";
  // }, []);

  const { t } = useTranslation("common");

  return (
    <Layout title={t("settings")}>
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Profile
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Notifications
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
        destination: "/api/auth/signin?callbackUrl=/settings",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
    },
  };
};

export default Settings;
