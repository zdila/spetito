import { NextApiRequest } from "next";
import { HttpError } from "./withHttpErrorHandler";

export function assertHttpMethod(req: NextApiRequest, ...methods: string[]) {
  if (!req.method || !methods.includes(req.method)) {
    throw new HttpError(405);
  }
}
