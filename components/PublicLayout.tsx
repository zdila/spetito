import Head from "next/head";
import { Box, Container } from "@mui/material";
import { Logo } from "./Logo";
import { ReactNode } from "react";
import { Footer } from "./Footer";

type Props = {
  title: string;
  children: ReactNode;
};

export function PublicLayout({ title, children }: Props) {
  return (
    <Container sx={{ py: 2 }}>
      <Head>
        <title>{(title ? title + " | " : "") + "Offerbook"}</title>
      </Head>

      <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
        <Logo />
      </Box>

      {children}

      <Footer />
    </Container>
  );
}
