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
import Head from "next/head";

const clientSideEmotionCache = createEmotionCache();

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: AppProps & { emotionCache: EmotionCache }) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={lightTheme}>
        <CssBaseline />

        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
