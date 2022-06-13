import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { Type } from "@sinclair/typebox";
import { validateSchema } from "../../../lib/schemaValidation";

const Body = Type.Object(
  {
    hideFewFriendsAlert: Type.Optional(Type.Boolean()),
    timeZone: Type.Optional(Type.String({ minLength: 2 })),
    useEmailNotif: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

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
      if (!validateSchema(Body, req.body)) {
        res.status(400).end();

        return;
      }

      const { hideFewFriendsAlert, timeZone, useEmailNotif } = req.body;

      await prisma.user.update({
        data: {
          hideFewFriendsAlert,
          timeZone,
          useEmailNotif,
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
