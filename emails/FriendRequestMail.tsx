import { Offer, User } from "@prisma/client";
import { formatDateTime } from "../utility/formatDateTime";
import { MailTemplate } from "./MailTemplate";

type Props = {
  sender: User;
  recipient: User;
};

const messages = {
  en: {
    title: "Spetito friend request",
    body: (sender: User, href: string) => (
      <>
        {sender.name} is sending you a <a href={href}>friend request</a>.
      </>
    ),
  },
  sk: {
    title: "Spetito - žiadosť o priateľstvo",
    body: (sender: User, href: string) => (
      <>
        {sender.name} vám posiela <a href={href}>žiadosť o priateľstvo</a>.
      </>
    ),
  },
};

export function FriendRequestMail({ sender, recipient }: Props) {
  const lang = (recipient.language ?? "en") as keyof typeof messages;

  const m = messages[lang];

  return (
    <MailTemplate lang={lang} title={m.title}>
      <p>
        {m.body(
          sender,
          process.env.BASE_URL + "/friends?highlight-user=" + sender.id
        )}
      </p>
    </MailTemplate>
  );
}
