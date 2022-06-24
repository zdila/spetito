import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import { HttpError } from "./withHttpErrorHandler";

export async function getSessionUserOrThrow(req: NextApiRequest) {
  const session = await getSession({ req });

  const user = session?.user;

  if (user) {
    return user;
  }

  throw new HttpError(403);
}
