import { Box, Typography } from "@mui/material";
import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../components/Layout";
import { NewOffer } from "../components/NewOffer";
import { OfferItem } from "../components/Offer";
import { prisma } from "../lib/prisma";
import { useFriends } from "../hooks/useFriends";
import { useLists } from "../hooks/useLists";

type Props = {
  friendsOffers: (Offer & { author: User | null })[];
  yourOffers: (Offer & {
    author: User | null;
    offerLists: (OfferList & { list: List })[];
    offerUsers: (OfferUser & { user: User })[];
  })[];
};

const Home: NextPage<Props> = ({ yourOffers, friendsOffers }) => {
  const router = useRouter();

  const friends = useFriends();

  const lists = useLists();

  const refresh = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  return (
    <Layout title="Offers">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Create offer
      </Typography>

      <NewOffer onCreate={refresh} friends={friends} lists={lists} />

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

  const friendsOffers = await prisma.offer.findMany({
    include: { author: true },
    where: {
      author: {
        followedBy: {
          some: {
            followerId: id,
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
              userId: id,
            },
          },
        },
        {
          offerLists: {
            some: {
              list: {
                members: {
                  some: {
                    userId: id,
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
          offerLists: {
            none: {},
          },
        },
      ],
    },
  });

  const yourOffers = await prisma.offer.findMany({
    include: {
      author: true,
      offerLists: {
        include: { list: true },
      },
      offerUsers: {
        include: { user: true },
      },
    },
    where: {
      userId: id,
    },
  });

  return {
    props: {
      friendsOffers,
      yourOffers,
    },
  };
};

export default Home;
