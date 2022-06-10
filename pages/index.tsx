import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Box, Typography } from "@mui/material";
import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { Layout } from "../components/Layout";
import { OfferForm } from "../components/OfferForm";
import { OfferItem } from "../components/Offer";
import { prisma } from "../lib/prisma";
import { useFriends } from "../hooks/useFriends";
import { useLists } from "../hooks/useLists";
import { supportsPush } from "../lib/capabilities";
import { useTranslation } from "next-i18next";
import { redirectToLogIn } from "../lib/auth";

type Props = {
  friendsOffers: (Offer & { author: User | null })[];
  yourOffers: (Offer & {
    author: User | null;
    offerLists: (OfferList & { list: List })[];
    offerUsers: (OfferUser & { user: User })[];
  })[];
  now: Date;
  timeZone: string | null;
};

const Home: NextPage<Props> = ({
  yourOffers,
  friendsOffers,
  now,
  timeZone,
}) => {
  const router = useRouter();

  const friends = useFriends();

  const lists = useLists();

  const refresh = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  useEffect(() => {
    if (!supportsPush) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "refreshOffers" ||
        event.data.type === "refreshFriends"
      ) {
        refresh();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [refresh]);

  const { t } = useTranslation("common");

  function compareOffers(a: Offer, b: Offer) {
    return (
      (a.validFrom ?? a.createdAt).getTime() -
      (b.validFrom ?? b.createdAt).getTime()
    );
  }

  return (
    <Layout title={t("Offers")}>
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("CreateOffer")}
      </Typography>

      <OfferForm onSaved={refresh} friends={friends} lists={lists} now={now} />

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("YourOffers")}
      </Typography>

      {yourOffers.length === 0 ? (
        // TODO active vs future vs historic offers
        <Typography color="text.secondary">{t("YouOfferNothing")}</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[...yourOffers].sort(compareOffers).map((offer) => (
            <OfferItem
              key={offer.id}
              offer={offer}
              onDelete={refresh}
              friends={friends}
              lists={lists}
              now={now}
              timeZone={timeZone ?? undefined}
              own
            />
          ))}
        </Box>
      )}

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("FriendsOffers")}
      </Typography>

      {friendsOffers.length === 0 ? (
        <Typography color="text.secondary">{t("NoOffersForYou")}</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[...friendsOffers].sort(compareOffers).map((offer) => (
            <OfferItem
              key={offer.id}
              offer={offer}
              onDelete={refresh}
              timeZone={timeZone ?? undefined}
            />
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

  const user = session?.user;

  if (!user) {
    return redirectToLogIn(context, "/");
  }

  const id = user.id;

  const friendsOffers = await prisma.offer.findMany({
    include: { author: true },
    where: {
      AND: [
        {
          OR: [
            {
              validTo: null,
            },
            {
              validTo: {
                gt: new Date(),
              },
            },
          ],
        },
        {
          hiddenOffers: {
            none: {
              userId: id,
            },
          },
        },
        {
          author: {
            OR: [
              {
                followedBy: {
                  some: {
                    followerId: id,
                  },
                },
              },
              {
                following: {
                  some: {
                    followingId: id,
                  },
                },
              },
            ],
          },
        },
        {
          OR: [
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
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      friendsOffers,
      yourOffers,
      now: new Date(),
      timeZone: user.extra.timeZone,
    },
  };
};

export default Home;
