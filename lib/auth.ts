import { GetServerSidePropsContext } from "next";

export function redirectToLogIn(
  context: GetServerSidePropsContext,
  path: string
) {
  const localePath = context.locale === "en" ? "" : "/" + context.locale;

  const callbackUrl = process.env.BASE_URL + localePath + path;

  return {
    redirect: {
      destination:
        localePath +
        "/auth/signin?callbackUrl=" +
        encodeURIComponent(callbackUrl),
      permanent: false,
    },
  };
}
