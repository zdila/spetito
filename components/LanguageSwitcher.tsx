import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";

export function LanguageSwitcher() {
  const { t } = useTranslation("common");

  const path = useRouter().asPath;

  const handleLangClick = (e: SyntheticEvent<HTMLAnchorElement>) => {
    const { lang } = e.currentTarget.dataset;

    if (lang) {
      document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    }
  };
  return (
    <Typography>
      {t("Language")}:{" "}
      <Link href={`/en${path}`} locale="en">
        <a onClick={handleLangClick} data-lang="en">
          English
        </a>
      </Link>
      {", "}
      <Link href={`/sk${path}`} locale="sk">
        <a onClick={handleLangClick} data-lang="sk">
          Slovensky
        </a>
      </Link>
    </Typography>
  );
}
