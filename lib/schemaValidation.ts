import { Static, Type, TSchema } from "@sinclair/typebox";
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2019";
import { HttpError } from "./withHttpErrorHandler";

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

function assertString(value: unknown): value is string {
  return typeof value === "string";
}

export function validateSchemaOrThrow<T extends TSchema>(
  schema: T,
  obj: unknown
): asserts obj is Static<T> {
  if (!ajv.validate(schema, obj)) {
    return undefined!;
  }

  throw new HttpError(400, {
    errorCode: "invalid_schema",
    details: ajv.errors,
  });
}
