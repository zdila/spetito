import { Offer, User } from "@prisma/client";
import { formatDateTime } from "../utility/formatDateTime";
import { MailTemplate } from "./MailTemplate";

type Props = {
  sender: User;
  recipient: User;
};

const messages = {
  en: {
    title: "Spetito friend request accepted",
    body: (sender: User, href: string) => (
      <>
        {sender.name} has <a href={href}>accepted your friend request</a>.
      </>
    ),
  },
  sk: {
    title: "Spetito - prijatá žiadosť o priateľstvo",
    body: (sender: User, href: string) => (
      <>
        {sender.name} prijal(a) vašu <a href={href}>žiadosť o priateľstvo</a>.
      </>
    ),
  },
};

export function AcceptFriendRequestMail({ sender, recipient }: Props) {
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
