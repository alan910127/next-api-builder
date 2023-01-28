import type { AnyParseFunction } from "./parser";

type ValidateRequest = {
  queryParsers?: AnyParseFunction[];
  query: unknown;
  bodyParsers?: AnyParseFunction[];
  body: unknown;
};

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

const combine = <T1, T2>(obj1: T1, obj2: T2): T1 & T2 => {
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    return { ...obj1, ...obj2 };
  }
  return clone(obj2) as T1 & T2;
};

type ParsingError<Err> = {
  query: Err[];
  body: Err[];
};

export const validateRequest = <Query, Body, Err extends Error>({
  queryParsers,
  query,
  bodyParsers,
  body,
}: ValidateRequest): {
  query: Query;
  body: Body;
  errors: ParsingError<Err>;
  isError: boolean;
} => {
  const errors: ParsingError<Err> = { query: [], body: [] };
  let parsedQuery = clone(query);
  let parsedBody = clone(body);

  queryParsers?.forEach((parser) => {
    try {
      parsedQuery = combine(parsedQuery, parser(query));
    } catch (e) {
      errors.query.push(e as Err);
    }
  });

  bodyParsers?.forEach((parser) => {
    try {
      parsedBody = combine(parsedBody, parser(body));
    } catch (e) {
      errors.body.push(e as Err);
    }
  });

  return {
    query: parsedQuery as Query,
    body: parsedBody as Body,
    errors,
    isError: errors.query.length > 0 || errors.body.length > 0,
  };
};
