import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { HttpError } from "./withHttpErrorHandler";

export function minutes(n: number) {
  return n * 60;
}

export function hours(n: number) {
  return n * 3600;
}

export function days(n: number) {
  return n * 24 * 3600;
}

export async function limit(
  key: string,
  maxCount: number,
  timeSpan: number,
  altPrisma?: Prisma.TransactionClient
) {
  await multiLimit([{ key, maxCount, timeSpan }], altPrisma);
}

export async function multiLimit(
  limits: {
    key: string;
    maxCount: number;
    timeSpan: number;
  }[],
  altPrisma?: Prisma.TransactionClient
) {
  const p = altPrisma ?? prisma;

  const counts = await Promise.all(
    limits.map(({ key, timeSpan }) =>
      p.limitLog.count({
        where: {
          key,
          createdAt: {
            lt: new Date(Date.now() + timeSpan * 1000),
          },
        },
      })
    )
  );

  if (limits.some((limit, i) => counts[i] >= limit.maxCount)) {
    throw new HttpError(429);
  }

  const now = new Date();

  await Promise.all(
    limits.map(({ key }) =>
      p.limitLog.create({
        data: {
          createdAt: now,
          key,
        },
      })
    )
  );
}
