import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Offer>
) {
  if (req.method === "PATCH" || req.method === "DELETE") {
    let { id } = req.query;

    if (typeof id !== "string") {
      res.status(400).end();

      return;
    }

    const session = await getSession({ req });

    const userId = session?.user?.id;

    if (id === "_self_") {
      id = userId;
    }

    if (!userId || userId !== id) {
      res.status(403).end();

      return;
    }

    if (req.method === "PATCH") {
      // TODO validate
      const { hideFewFriendsAlert, timeZone, useEmailNotif, usePushNotif } =
        req.body as {
          hideFewFriendsAlert?: boolean;
          timeZone?: string;
          useEmailNotif?: boolean;
          usePushNotif?: boolean;
        };

      await prisma.user.update({
        data: {
          hideFewFriendsAlert,
          timeZone,
          useEmailNotif,
          usePushNotif,
        },
        where: {
          id,
        },
      });
    } else if (req.method === "DELETE") {
      await prisma.user.delete({
        where: {
          id,
        },
      });
    }

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
