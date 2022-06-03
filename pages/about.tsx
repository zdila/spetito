import type { GetServerSideProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { About } from "../components/About";
import { Layout } from "../components/Layout";

type Props = {};

const AboutPage: NextPage<Props> = ({}) => {
  const { t } = useTranslation();

  return (
    <Layout title={t("About")}>
      <About />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
    },
  };
};

export default AboutPage;
