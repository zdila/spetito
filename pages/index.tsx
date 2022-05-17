import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Offer } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { NewOffer } from "../components/NewOffer";
import { Offer as OfferComponent } from "../components/Offer";
import { prisma } from "../lib/prisma";

type Props = {
  friendsOffers: Offer[];
  yourOffers: Offer[];
};

const Home: NextPage<Props> = ({ yourOffers, friendsOffers }) => {
  const router = useRouter();

  return (
    <Layout title="Offers">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Create offer
      </Typography>

      <NewOffer
        onCreate={() => {
          router.replace(router.asPath);
        }}
      />

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Your offers
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {yourOffers.map((offer) => (
          <OfferComponent
            key={offer.id}
            owner="Martin"
            from={offer.validFrom}
            to={offer.validTo}
            audience={["Rodina", "Kamaráti"]}
            text={offer.message}
          />
        ))}
      </Box>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Friend&apos;s offers
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {friendsOffers.map((offer) => (
          <OfferComponent
            key={offer.id}
            owner="Martin"
            from={offer.validFrom}
            to={offer.validTo}
            audience={["Rodina", "Kamaráti"]}
            text={offer.message}
          />
        ))}
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const email = session?.user?.email;

  if (!email) {
    return {
      redirect: {
        // destination: "/login",
        destination: "/api/auth/signin?callbackUrl=/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      friendsOffers: await prisma.offer.findMany({
        where: {
          author: {
            followedBy: {
              some: {
                follower: {
                  email,
                },
              },
            },
          },
        },
      }),
      yourOffers: await prisma.offer.findMany({
        where: {
          author: {
            email,
          },
        },
      }),
    },
  };
};

export default Home;
