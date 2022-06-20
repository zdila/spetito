import { Offer, User } from "@prisma/client";
import { ReactElement } from "react";
import { Trans, useTranslation } from "react-i18next";
import { markupToReact } from "../lib/markupToReact";
import { formatTimeRange } from "../utility/formatDateTime";
import { MailTemplate } from "./MailTemplate";

type Props = {
  offerrer: string;
  offer: Offer;
  recipient: User;
};

export function OfferMail(props: Props) {
  return (
    <MailTemplate language={props.recipient.language} titleKey="offer.title">
      <OfferMailInt {...props} />
    </MailTemplate>
  );
}

function OfferMailInt({ offerrer, offer, recipient }: Props) {
  const { t: ct } = useTranslation("common");

  const { t } = useTranslation("mail", { keyPrefix: "offer" });

  const hasTime = Boolean(offer.validFrom || offer.validTo);

  const components: Record<string, ReactElement> = {
    appLink: (
      <a href={process.env.BASE_URL + "/?highlight-offer=" + offer.id} />
    ),
  };

  if (hasTime) {
    components["timeRange"] = formatTimeRange(
      offer.validFrom,
      offer.validTo,
      recipient.language,
      recipient.timeZone,
      new Date(),
      ct,
      <span style={{ color: "red" }} />,
      true
    );
  }
  return (
    <>
      <p>
        <Trans
          t={t}
          i18nKey={hasTime ? "bodyWithTime" : "body"}
          values={{ offerrer }}
          components={components}
        />
      </p>

      <div
        style={{
          backgroundColor: "#eee",
          padding: "1rem",
          borderRadius: "4px",
        }}
      >
        {markupToReact(offer.message)}
      </div>
    </>
  );
}
