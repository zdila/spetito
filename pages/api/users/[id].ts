import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { Type } from "@sinclair/typebox";
import { validateSchemaOrThrow } from "../../../lib/schemaValidation";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";

const Body = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    hideFewFriendsAlert: Type.Optional(Type.Boolean()),
    timeZone: Type.Optional(Type.String({ minLength: 2 })),
    useEmailNotif: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse<Offer>) {
  if (req.method === "PATCH" || req.method === "DELETE") {
    let { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const session = await getSession({ req });

    const userId = session?.user?.id;

    if (id === "_self_") {
      id = userId;
    }

    if (!userId || userId !== id) {
      throw new HttpError(403);
    }

    if (req.method === "PATCH") {
      validateSchemaOrThrow(Body, req.body);

      const { hideFewFriendsAlert, timeZone, useEmailNotif, name } = req.body;

      await prisma.user.update({
        data: {
          name,
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
