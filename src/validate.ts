import type { AnyParseFunction } from "./parser";

type ValidateRequest = {
  queryParsers?: AnyParseFunction[];
  query: unknown;
  bodyParsers?: AnyParseFunction[];
  body: unknown;
};

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

export const validateRequest = <Query, Body, Err extends Error>({
  queryParsers,
  query,
  bodyParsers,
  body,
}: ValidateRequest): {
  errors: Err[];
  query: Query;
  body: Body;
} => {
  const errors: Err[] = [];
  let typedQuery = clone(query);
  let typedBody = clone(body);

  queryParsers?.forEach((parser) => {
    try {
      typedQuery = parser(typedQuery);
    } catch (e) {
      errors.push(e as Err);
    }
  });
  bodyParsers?.forEach((parser) => {
    try {
      typedBody = parser(typedBody);
    } catch (e) {
      errors.push(e as Err);
    }
  });

  return { query: typedQuery as Query, body: typedBody as Body, errors };
};
