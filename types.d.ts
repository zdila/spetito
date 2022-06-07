import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      extra: {
        hideFewFriendsAlert: boolean;
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
