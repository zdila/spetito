import { Static, Type, TSchema } from "@sinclair/typebox";
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2019";
import { NextApiResponse } from "next";

// export class SchemaError extends Error {
//   constructor(message?: string) {
//     super(message);
//     this.name = "SchemaError";
//   }
// }

const ajv = addFormats(new Ajv({}), [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
])
  .addKeyword("kind")
  .addKeyword("modifier");

export function validateSchema<T extends TSchema>(
  schema: T,
  obj: unknown
): obj is Static<T> {
  const ok = ajv.validate(schema, obj);

  if (!ok) {
    console.error(ajv.errorsText(ajv.errors));
  }

  return ok;
}
