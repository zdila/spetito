import {
  List,
  Offer,
  OfferList,
  OfferUser,
  User as PrismaUser,
} from "@prisma/client";
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends PrismaUser {}

  interface Session {
    user?: User;
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
  author: PrismaUser | null;

  offerLists?: (OfferList & { list: List })[];
  offerUsers?: (OfferUser & { user: PrismaUser })[];
};
