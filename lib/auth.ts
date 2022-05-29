import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

export function redirectToLogIn(
  context: GetServerSidePropsContext,
  path: string
) {
  return {
    redirect: {
      destination: `/api/auth/signin?callbackUrl=${
        context.locale === "en" ? "" : "/" + context.locale
      }${path}`,
      permanent: false,
    },
  };
}
