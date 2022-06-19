import { User } from "@prisma/client";
import { Trans, useTranslation } from "react-i18next";
import { MailTemplate } from "./MailTemplate";

type Props = {
  url: string;
  email: string;
  language?: string;
};

export function SignInMail({ language, ...rest }: Props) {
  return (
    <MailTemplate language={language} titleKey="signIn.title" login>
      <SignInMailInt {...rest} />
    </MailTemplate>
  );
}

function SignInMailInt({ url, email }: Props) {
  const { t } = useTranslation("mail", { keyPrefix: "signIn" });

  return (
    <p>
      <Trans
        t={t}
        i18nKey="body"
        values={{
          email: email.replace(/([@.])/g, "​$1​"), // surrounded by zero-width spaces to prevent linkifying
        }}
        components={{
          signInLink: <a href={url} />,
          bold: <b />,
        }}
      />
    </p>
  );
}
