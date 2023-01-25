import type { ZodError, ZodFormattedError, ZodType } from "zod";
import { z } from "zod";

export const formatErrors = (
  errors: ZodFormattedError<Map<string, string>, string>
) => {
  return Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}`;
    })
    .filter(Boolean);
};

type MaybeValidated<Schema extends ZodType> = {
  schema?: Schema;
  data: unknown;
};

const validate = <Schema extends ZodType>({
  schema,
  data,
}: MaybeValidated<Schema>) => {
  if (schema == null) {
    return null;
  }
  return schema.safeParse(data);
};

type ValidateRequest<
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
> = {
  querySchema?: Query;
  query: unknown;
  bodySchema?: Body;
  body: unknown;
};

type ValidateRequestOutput<
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
> =
  | {
      success: true;
      query: z.infer<Query>;
      body: z.infer<Body>;
    }
  | { success: false; errors: ZodError[] };

export const validateRequest = <
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
>({
  querySchema,
  query,
  bodySchema,
  body,
}: ValidateRequest<Query, Body>): ValidateRequestOutput<Query, Body> => {
  const errors: ZodError[] = [];

  const parsedQuery = validate<Query>({ schema: querySchema, data: query });
  const isQueryFailed = parsedQuery?.success === false;
  if (isQueryFailed) {
    errors.push(parsedQuery.error);
  }

  const parsedBody = validate<Body>({ schema: bodySchema, data: body });
  const isBodyFailed = parsedBody?.success === false;
  if (isBodyFailed) {
    errors.push(parsedBody.error);
  }

  if (isQueryFailed || isBodyFailed) {
    return { success: false, errors };
  }

  return { success: true, query: parsedQuery?.data, body: parsedBody?.data };
};
