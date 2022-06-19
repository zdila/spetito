/* eslint-disable @next/next/no-head-element */

import { ReactNode } from "react";
import { I18nextProvider, useSSR, useTranslation } from "react-i18next";
import { i18nInstance, resources } from "./translation";

type Props = {
  titleKey: string;
  children: ReactNode;
  language?: string | null;
};

export function MailTemplate(props: Props) {
  return (
    <I18nextProvider i18n={i18nInstance}>
      <MailTemplateInt {...props} />
    </I18nextProvider>
  );
}

// design at https://codesandbox.io/s/ancient-sound-v6m12g?file=/src/App.js:745-780

function MailTemplateInt({ children, language, titleKey }: Props) {
  useSSR(resources, language ?? "en");

  const { t } = useTranslation("mail");

  return (
    <html style={{ margin: 0, padding: 0 }}>
      <head lang={language ?? "en"}>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{t(titleKey)}</title>
      </head>

      <body
        style={{
          backgroundColor: "#eee",
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.5",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              display: "inline-block",
              backgroundColor: "#6a1b9a",
              padding: "0 0.5rem",
              color: "white",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
          >
            Spetito
          </div>

          <div
            style={{
              fontSize: "1.125rem",
              marginTop: "1rem",
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            {children}
          </div>

          <div style={{ fontSize: "90%", color: "#888" }}>
            <p>{t("template.noReply")}</p>

            <p>
              {t("template.unsubscribeInfo")}
              <a href={process.env.BASE_URL + "/settings"}>
                {process.env.BASE_URL + "/settings"}
              </a>
              .
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
