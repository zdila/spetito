import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export class HttpError<T = undefined> extends Error {
  statusCode: number;
  body?: T;

  constructor(statusCode: number, body?: T) {
    super();

    this.name = "HttpError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export function withHttpErrorHandler<T>(handle: NextApiHandler<T>) {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    try {
      return await handle(req, res);
    } catch (e) {
      if (e instanceof HttpError) {
        res.status(e.statusCode);

        if (e.body !== undefined) {
          res.end();
        } else {
          res.send(e.body);
        }
      } else {
        throw e;
      }
    }
  };
}
