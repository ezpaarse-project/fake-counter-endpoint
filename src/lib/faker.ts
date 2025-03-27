import zodToJsonSchema from 'zod-to-json-schema';
import { JSONSchemaFaker } from 'json-schema-faker';
import hash from 'object-hash';
import { z } from 'zod';

const jsonSchemas = new Map<string, ReturnType<typeof zodToJsonSchema>>();

export default async function fakeZodSchema<T>(zod: z.ZodSchema<T>): Promise<T> {
  // Cache generated JSON schemas
  const key = hash(zod);
  let schema = jsonSchemas.get(key);
  if (!schema) {
    schema = zodToJsonSchema(zod);
    jsonSchemas.set(key, schema);
  }

  const res = await JSONSchemaFaker.resolve(schema);
  return res as T;
}
