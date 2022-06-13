/* eslint-disable @next/next/no-head-element */

import { ReactNode } from "react";

type Props = {
  lang: "en" | "sk";
  title: string;
  children: ReactNode;
};

const messages = {
  en: {
    noReply: "Please do not reply to this email.",
    unsubscribeInfo: "You can manage notification messages at ",
  },
  sk: {
    noReply: "Prosím, neodpovedajte na tento email.",
    unsubscribeInfo: "Notifikačné oznámenia môžete spravovať na ",
  },
};

export function MailTemplate({ lang, children, title }: Props) {
  const m = messages[lang];

  return (
    <html lang={lang}>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{title}</title>
      </head>

      <body>
        {children}

        <hr />

        <p>{m.noReply}</p>

        <p>
          {m.unsubscribeInfo}
          <a href={process.env.BASE_URL + "/settings"}>
            {process.env.BASE_URL + "/settings"}
          </a>
          .
        </p>
      </body>
    </html>
  );
}
