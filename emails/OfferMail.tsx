import { Offer, User } from "@prisma/client";
import { Trans, useTranslation } from "react-i18next";
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

  return (
    <>
      <p>
        <Trans
          t={t}
          i18nKey="body"
          values={{ offerrer }}
          components={{
            link: (
              <a
                href={process.env.BASE_URL + "/?highlight-offer=" + offer.id}
              />
            ),
          }}
        />
      </p>

      <p>
        <i>{offer.message}</i>
      </p>

      {(offer.validFrom || offer.validTo) && (
        <p>
          {t("valid")}{" "}
          {formatTimeRange(
            offer.validFrom,
            offer.validTo,
            recipient.language,
            recipient.timeZone,
            new Date(),
            ct,
            <span style={{ color: "red" }} />,
            true
          )}
        </p>
      )}
    </>
  );
}
