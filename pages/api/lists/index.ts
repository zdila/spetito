import { List } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { Type } from "@sinclair/typebox";
import { validateSchemaOrThrow } from "../../../lib/schemaValidation";
import { withHttpErrorHandler } from "../../../lib/withHttpErrorHandler";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";

const Body = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export default withHttpErrorHandler(handler);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<List | List[]>
) {
  if (req.method === "POST") {
    const user = await getSessionUserOrThrow(req);

    validateSchemaOrThrow(Body, req.body);

    const { name } = req.body;

    res.json(
      await prisma.list.create({
        data: {
          name,
          userId: user.id,
        },
      })
    );
  } else if (req.method === "GET") {
    const user = await getSessionUserOrThrow(req);

    res.json(
      await prisma.list.findMany({
        where: {
          userId: user.id,
        },
      })
    );
  } else {
    res.status(405).end();
  }
}
