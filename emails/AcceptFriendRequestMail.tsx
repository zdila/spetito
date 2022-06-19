import { User } from "@prisma/client";
import { Trans, useTranslation } from "react-i18next";
import { MailTemplate } from "./MailTemplate";

type Props = {
  sender: User;
  recipient: User;
};

export function AcceptFriendRequestMail(props: Props) {
  return (
    <MailTemplate
      language={props.recipient.language}
      titleKey="acceptFriendRequest.title"
    >
      <AcceptFriendRequestMailInt {...props} />
    </MailTemplate>
  );
}

function AcceptFriendRequestMailInt({ sender }: Props) {
  const { t } = useTranslation("mail", { keyPrefix: "acceptFriendRequest" });

  return (
    <p>
      <Trans
        t={t}
        i18nKey="body"
        values={{ friend: sender.name }}
        components={{
          appLink: (
            <a
              href={
                process.env.BASE_URL + "/friends?highlight-user=" + sender.id
              }
            />
          ),
        }}
      />
    </p>
  );
}
