import { useRouter } from "next/router";
import { lazy, Suspense } from "react";

export function About() {
  const { locale } = useRouter();

  const AboutLocalized = lazy(() => import("./About." + locale));

  return (
    <Suspense>
      <AboutLocalized />
    </Suspense>
  );
}
