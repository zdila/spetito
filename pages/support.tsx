import { Paper } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { About } from "../components/About";
import { Layout } from "../components/Layout";
import { SupportLinks } from "../components/SupportLinks";
import { redirectToLogIn } from "../lib/auth";

type Props = {};

const SupportPage: NextPage<Props> = ({}) => {
  const { t } = useTranslation();

  return (
    <Layout title={t("Support")}>
      <SupportLinks />

      <Paper sx={{ my: 2, py: 1, px: 2 }}>
        <About />
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
    return redirectToLogIn(context, "/lists");
  }

  return {
    props: await serverSideTranslations(context.locale ?? "en", ["common"]),
  };
};

export default SupportPage;
