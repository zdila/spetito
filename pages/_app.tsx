import type { AppContext, AppInitialProps, AppProps } from "next/app";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createEmotionCache } from "../utility/createEmotionCache";
import { darkTheme, lightTheme } from "../styles/theme/themes";
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
import { SnackbarProvider } from "notistack";
import { useDarkMode } from "../hooks/useDarkMode";

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

  const darkMode = useDarkMode(pageProps.isDarkMode);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
          <CssBaseline />

          <SessionProvider session={pageProps.session}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={localeMap[locale] ?? enLocale}
            >
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Component {...pageProps} />
              </SnackbarProvider>
            </LocalizationProvider>
          </SessionProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
}

MyApp.getInitialProps = async ({
  ctx,
}: AppContext): Promise<AppInitialProps> => {
  const darkMode = (ctx.req as any).cookies?.["DARK_MODE"];

  return {
    pageProps: {
      isDarkMode:
        darkMode === "true" ? true : darkMode === "false" ? false : undefined,
    },
  };
};

export default appWithTranslation(MyApp);
