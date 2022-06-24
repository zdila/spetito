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
  author: PublicUser;

  offerLists?: (OfferList & { list: List })[];
  offerUsers?: (OfferUser & { user: PublicUser })[];
};

// define custom colors: https://material-ui.com/customization/palette/
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    oldOffer: Palette["primary"];
    highlightItem: Palette["primary"];
  }
  interface PaletteOptions {
    oldOffer: PaletteOptions["primary"];
    highlightItem: PaletteOptions["primary"];
  }
}

// Extend color prop on components
declare module "@mui/material/Chip" {
  export interface ChipPropsColorOverrides {
    oldOffer: true;
    highlightItem: true;
  }
}

export type PublicUser = Pick<User, "id" | "name" | "image">;
