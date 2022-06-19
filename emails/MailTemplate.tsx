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

function MailTemplateInt({ children, language, titleKey }: Props) {
  useSSR(resources, language ?? "en");

  const { t } = useTranslation("mail");

  return (
    <html>
      <head lang={language ?? "en"}>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{t(titleKey)}</title>
      </head>

      <body>
        {children}

        <hr />

        <p>{t("template.noReply")}</p>

        <p>
          {t("template.unsubscribeInfo")}
          <a href={process.env.BASE_URL + "/settings"}>
            {process.env.BASE_URL + "/settings"}
          </a>
          .
        </p>
      </body>
    </html>
  );
}
