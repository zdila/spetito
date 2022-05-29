import { List } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

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

    // TODO validate
    const { name } = req.body as {
      name: string;
    };

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
