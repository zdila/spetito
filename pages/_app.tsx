import type { AppProps } from "next/app";
import React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createEmotionCache } from "../utility/createEmotionCache";
import { lightTheme } from "../styles/theme/lightTheme";
import "../styles/globals.css";
import { EmotionCache } from "@emotion/cache";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRouter } from "next/router";
import enLocale from "date-fns/locale/en-US";
import skLocale from "date-fns/locale/sk";
import Head from "next/head";

const clientSideEmotionCache = createEmotionCache();

const localeMap: Record<string, Locale> = {
  en: enLocale,
  sk: skLocale,
};

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: AppProps & { emotionCache: EmotionCache }) {
  const { locale = "en" } = useRouter();

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={lightTheme}>
          <CssBaseline />

          <SessionProvider session={pageProps.session}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={localeMap[locale] ?? enLocale}
            >
              <Component {...pageProps} />
            </LocalizationProvider>
          </SessionProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
