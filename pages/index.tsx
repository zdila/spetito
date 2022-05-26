import { Box, Typography } from "@mui/material";
import { Offer } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../components/Layout";
import { NewOffer } from "../components/NewOffer";
import { OfferItem } from "../components/Offer";
import { prisma } from "../lib/prisma";

type Props = {
  friendsOffers: Offer[];
  yourOffers: Offer[];
};

const Home: NextPage<Props> = ({ yourOffers, friendsOffers }) => {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  return (
    <Layout title="Offers">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Create offer
      </Typography>

      <NewOffer onCreate={refresh} />

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Your offers
      </Typography>

      {yourOffers.length === 0 ? (
        // TODO active vs future vs historic offers
        <Typography color="text.secondary">
          You offer nothing currenly.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {yourOffers.map((offer) => (
            <OfferItem key={offer.id} offer={offer} onDelete={refresh} />
          ))}
        </Box>
      )}

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Friend&apos;s offers
      </Typography>

      {friendsOffers.length === 0 ? (
        <Typography>There are no offers for you currently 😞</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {friendsOffers.map((offer) => (
            <OfferItem key={offer.id} offer={offer} />
          ))}
        </Box>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const id = session?.user?.id;

  if (!id) {
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
                  id,
                },
              },
            },
          },
          OR: [
            {
              public: true,
            },
            {
              offerUsers: {
                some: {
                  user: {
                    id,
                  },
                },
              },
            },
            {
              offerGroups: {
                some: {
                  group: {
                    members: {
                      some: {
                        member: {
                          id,
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              offerUsers: {
                none: {},
              },
              offerGroups: {
                none: {},
              },
            },
          ],
        },
      }),
      yourOffers: await prisma.offer.findMany({
        where: {
          author: {
            id,
          },
        },
      }),
    },
  };
};

export default Home;
