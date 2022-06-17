import { Box, Container, Paper, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";

type Props = {};

export default function VerifyRequest({}: Props) {
  const { t } = useTranslation();

  return (
    <Container sx={{ py: 2 }}>
      <Head>
        <title>Spetito</title>
      </Head>

      <Box sx={{ alignSelf: "flex-start" }}>
        <Logo />
      </Box>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("CheckYourEmail")}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Box
          sx={[
            {
              display: "flex",
              gap: 1,
              alignItems: "center",
              justifyContent: "center",
            },
            (theme) => ({
              [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
                alignItems: "stretch",
              },
            }),
          ]}
        >
          <Typography>{t("SignInEmailInfo")}</Typography>
        </Box>
      </Paper>

      <Footer />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
    },
  };
};
