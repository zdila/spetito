import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { getProviders, signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { About } from "../../components/About";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { Logo } from "../../components/Logo";

type Props = { providers: Awaited<ReturnType<typeof getProviders>> };

export default function SignIn({ providers }: Props) {
  const { t } = useTranslation();

  const { query } = useRouter();

  return (
    <Container>
      <Head>
        <title>Offerbook</title>
      </Head>

      <Logo />

      <Paper sx={{ p: 2, my: 1 }}>
        <About />

        <Divider />

        <Box
          sx={{
            marginX: "auto",
            width: "fit-content",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
          }}
        >
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
                {t("signInWith", { provider: provider.name })}
              </Button>
            ))}
        </Box>
      </Paper>

      <Box
        component="footer"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography>&copy; Martin Ždila 2022</Typography>

        <Box>
          <Link href="/privacy-policy">
            <a>{t("PrivacyPolicy")}</a>
          </Link>
          ｜
          <Link href="/terms-of-services">
            <a>{t("TermsOfServices")}</a>
          </Link>
          ｜
          <Box sx={{ display: "inline-block" }}>
            <LanguageSwitcher />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const providers = await getProviders();

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),

      providers,
    },
  };
};
