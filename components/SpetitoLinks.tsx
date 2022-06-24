import { Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

export function SpetitoLinks() {
  return (
    <Typography>
      &copy; Spetito 2022｜
      <Link href="mailto:info@spetito.com">spetito@spetito.com</Link>｜
      <Link
        href="https://www.facebook.com/SpetitoCom"
        sx={{ display: "inline-flex", verticalAlign: "middle" }}
      >
        <FacebookIcon fontSize="small" />
      </Link>
      ｜
      <Link
        href="https://twitter.com/Spetito_com"
        sx={{ display: "inline-flex", verticalAlign: "middle" }}
      >
        <TwitterIcon fontSize="small" />
      </Link>
    </Typography>
  );
}
