import nodemailer from "nodemailer";
import { Address } from "nodemailer/lib/mailer";
import { createElement, FunctionComponent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { decode } from "html-entities";
import { htmlToText } from "html-to-text";

const transport = nodemailer.createTransport({
  port: Number(process.env.EMAIL_SERVER_PORT ?? "465"),
  host: process.env.EMAIL_SERVER_HOST,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export function sendMail<P>(
  bcc: string | Address | (string | Address)[],
  template: FunctionComponent<P>,
  props: P
) {
  const html = renderToStaticMarkup(createElement<P>(template, props));

  transport.sendMail(
    {
      from: process.env.EMAIL_FROM,
      bcc,
      subject: decode(html.match(/<title>(.*?)<\/title>/)?.[1]),
      html,
      text: htmlToText(html),
    },
    (err) => {
      if (err) {
        console.error("Error sending email.", err);
      }
    }
  );
}
