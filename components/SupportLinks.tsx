import { Link as MuiLink, Box } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";

export function SupportLinks() {
  const { t } = useTranslation();

  return (
    <Box sx={{ mt: 2 }}>
      <Link href="/support" passHref>
        <MuiLink>{t("About")}</MuiLink>
      </Link>
      ｜
      <Link href="/privacy-policy" passHref>
        <MuiLink>{t("PrivacyPolicy")}</MuiLink>
      </Link>
      ｜
      <Link href="/terms-of-services" passHref>
        <MuiLink>{t("TermsOfServices")}</MuiLink>
      </Link>
    </Box>
  );
}
