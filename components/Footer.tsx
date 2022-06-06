import { Box, Typography, Link as MuiLink } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";

import { LanguageSwitcher } from "./LanguageSwitcher";

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
      <Typography>
        &copy; <MuiLink href="mailto:m.zdila@gmail.com">Martin Ždila</MuiLink>{" "}
        2022
      </Typography>

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
