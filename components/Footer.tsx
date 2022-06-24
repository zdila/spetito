import { Box, Link as MuiLink } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { SpetitoLinks } from "./SpetitoLinks";

export function Footer() {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <SpetitoLinks />

      <Box>
        <Link href="/privacy-policy" passHref>
          <MuiLink>{t("PrivacyPolicy")}</MuiLink>
        </Link>
        ｜
        <Link href="/terms-of-services" passHref>
          <MuiLink>{t("TermsOfServices")}</MuiLink>
        </Link>
        ｜
        <Box sx={{ display: "inline-block" }}>
          <LanguageSwitcher />
        </Box>
      </Box>
    </Box>
  );
}
