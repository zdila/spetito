import { GetServerSidePropsContext } from "next";

export function redirectToLogIn(
  context: GetServerSidePropsContext,
  path: string
) {
  const callbackUrl =
    process.env.BASE_URL +
    (context.locale === "en" ? "" : "/" + context.locale) +
    path;

  return {
    redirect: {
      destination: "/api/auth/signin?callbackUrl=" + callbackUrl,
      permanent: false,
    },
  };
}
