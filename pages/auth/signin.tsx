import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { getProviders, getSession, signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { About } from "../../components/About";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";

type Props = {
  providers: Awaited<ReturnType<typeof getProviders>>;
};

export default function SignIn({ providers }: Props) {
  const { t } = useTranslation();

  const { query } = useRouter();

  return (
    <Container sx={{ py: 2 }}>
      <Head>
        <title>Spetito</title>
      </Head>

      <Box sx={{ alignSelf: "flex-start" }}>
        <Logo />
      </Box>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("SignIn")}
      </Typography>

      <Paper sx={{ p: 2 }}>
        {query.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("signInError." + query.error)}
          </Alert>
        )}

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
          <Typography>{t("SignInWith")}</Typography>

          {providers &&
            Object.values(providers).map((provider) => (
              <Button
                key={provider.name}
                onClick={() =>
                  signIn(provider.id, {
                    callbackUrl:
                      (Array.isArray(query.callbackUrl)
                        ? query.callbackUrl[0]
                        : query.callbackUrl) || "/",
                  })
                }
              >
                {provider.name}
              </Button>
            ))}
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("About")}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <About />
      </Paper>

      <Footer />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [providers, session] = await Promise.all([
    getProviders(),
    getSession(context),
  ]);

  return session?.user
    ? {
        redirect: {
          destination: getStringOrNothing(context.query.callbackUrl) ?? "/",
          permanent: false,
        },
      }
    : {
        props: {
          ...(await serverSideTranslations(context.locale ?? "en", ["common"])),

          providers,
        },
      };
};

function getStringOrNothing(a: string | string[] | undefined) {
  return typeof a === "string" ? a : undefined;
}
