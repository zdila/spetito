import { Typography, Link as MuiLink } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";

export function LanguageSwitcher() {
  const { t } = useTranslation("common");

  const path = useRouter().asPath;

  const handleLangClick = (e: SyntheticEvent<HTMLElement>) => {
    const { lang } = e.currentTarget.dataset;

    if (lang) {
      document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    }
  };

  return (
    <Typography>
      {t("Language")}:{" "}
      <Link href={`/en${path}`} locale="en" passHref>
        <MuiLink onClick={handleLangClick} data-lang="en">
          English
        </MuiLink>
      </Link>
      {", "}
      <Link href={`/sk${path}`} locale="sk" passHref>
        <MuiLink onClick={handleLangClick} data-lang="sk">
          Slovensky
        </MuiLink>
      </Link>
    </Typography>
  );
}
