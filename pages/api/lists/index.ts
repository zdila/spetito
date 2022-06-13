import { List } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { Type } from "@sinclair/typebox";
import { validateSchema } from "../../../lib/schemaValidation";

const Body = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<List | List[]>
) {
  if (req.method === "POST") {
    const session = await getSession({ req });

    const userId = session?.user?.id;

    if (!userId) {
      res.status(403).end();

      return;
    }

    if (!validateSchema(Body, req.body)) {
      res.status(400).end();

      return;
    }

    const { name } = req.body;

    res.json(
      await prisma.list.create({
        data: {
          name,
          userId,
        },
      })
    );
  } else if (req.method === "GET") {
    const session = await getSession({ req });

    const userId = session?.user?.id;

    if (!userId) {
      res.status(403).end();

      return;
    }

    res.json(
      await prisma.list.findMany({
        where: {
          userId,
        },
      })
    );
  } else {
    res.status(405).end();
  }
}
