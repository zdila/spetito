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

export async function limit(key: string, maxCount: number, timeSpan: number) {
  const count = await prisma.limitLog.count({
    where: {
      key,
      createdAt: {
        lt: new Date(Date.now() + timeSpan * 1000),
      },
    },
  });

  if (count > maxCount) {
    throw new HttpError(429);
  }

  await prisma.limitLog.create({
    data: {
      createdAt: new Date(),
      key,
    },
  });
}
