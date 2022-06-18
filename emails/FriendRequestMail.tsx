import { User } from "@prisma/client";
import { Trans, useTranslation } from "react-i18next";
import { MailTemplate } from "./MailTemplate";

type Props = {
  sender: User;
  recipient: User;
};

export function FriendRequestMail(props: Props) {
  return (
    <MailTemplate
      language={props.recipient.language}
      titleKey="friendRequest.title"
    >
      <FriendRequestMailInt {...props} />
    </MailTemplate>
  );
}

function FriendRequestMailInt({ sender, recipient }: Props) {
  const { t } = useTranslation("mail", { keyPrefix: "friendRequest" });

  return (
    <p>
      <Trans
        t={t}
        i18nKey="body"
        values={{ requester: sender.name }}
        components={{
          link: (
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
