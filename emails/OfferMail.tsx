import { Offer, User } from "@prisma/client";
import { formatDateTime } from "../utility/formatDateTime";
import { MailTemplate } from "./MailTemplate";

type Props = {
  offerrer: string;
  offer: Offer;
  recipient: User;
};

const messages = {
  en: {
    title: "New offer on Spetito",
    body: (offerrer: string, href: string) => (
      <>
        {offerrer} placed a <a href={href}>new offer</a>:
      </>
    ),
    validFrom: "Valid from ",
    validTo: "Valid to ",
    to: " to ",
  },
  sk: {
    title: "Spetito - nová ponuka",
    body: (offerrer: string, href: string) => (
      <>
        {offerrer} dal(a) <a href={href}>novú ponuku</a>:
      </>
    ),
    validFrom: "Platné od ",
    validTo: "Platné do ",
    to: " do ",
  },
};

export function OfferMail({ offerrer, offer, recipient }: Props) {
  const lang = (recipient.language ?? "en") as keyof typeof messages;

  const m = messages[lang];

  return (
    <MailTemplate lang={lang} title={m.title}>
      <p>
        {m.body(
          offerrer,
          process.env.BASE_URL + "/?highlight-offer=" + offer.id
        )}
      </p>

      <p>
        <i>{offer.message}</i>
      </p>

      {(offer.validFrom || offer.validTo) && (
        <p>
          {offer.validFrom &&
            m.validFrom +
              formatDateTime(
                offer.validFrom,
                recipient.language,
                recipient.timeZone
              )}

          {offer.validTo &&
            (offer.validFrom ? m.to : m.validTo) +
              formatDateTime(
                offer.validTo,
                recipient.language,
                recipient.timeZone
              )}
        </p>
      )}
    </MailTemplate>
  );
}
