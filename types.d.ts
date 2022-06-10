import { List, Offer, OfferList, OfferUser, User } from "@prisma/client";
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      extra: {
        hideFewFriendsAlert: boolean;
        timeZone: string | null;
      };
    };
  }
}

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: { revision: string; url: string }[];
  }

  interface Window {
    _spetito_hideFewFriendsAlert?: true;
  }
}

export type OfferExt = Offer & {
  author: User | null;

  offerLists?: (OfferList & { list: List })[];
  offerUsers?: (OfferUser & { user: User })[];
};
