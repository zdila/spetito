import { Typography } from "@mui/material";
import { purple } from "@mui/material/colors";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function Logo() {
  const session = useSession();

  return (
    <Link
      href={session.status === "authenticated" ? "/" : "/auth/signin"}
      passHref
    >
      <Typography
        variant="h4"
        display="inline-block"
        component="a"
        sx={{
          backgroundColor: purple[800],
          px: 1,
          color: "white",
          fontWeight: "bold",
          borderRadius: 1,
        }}
      >
        Offerbook
      </Typography>
    </Link>
  );
}
