import { Link as MuiLink, Box, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";

export function SupportLinks() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Typography>
        &copy; Spetito 2022｜
        <MuiLink href="mailto:info@spetito.com">spetito@spetito.com</MuiLink>
      </Typography>

      <Box>
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
    </Box>
  );
}
