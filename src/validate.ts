import type { AnyParseFunction } from "./parser";

type ValidateRequest = {
  queryParsers?: AnyParseFunction[];
  query: unknown;
  bodyParsers?: AnyParseFunction[];
  body: unknown;
};

export const validateRequest = ({
  queryParsers,
  query,
  bodyParsers,
  body,
}: ValidateRequest) => {
  const errors: Error[] = [];

  queryParsers?.forEach((parser) => {
    try {
      parser(query);
    } catch (e) {
      errors.push(e as Error);
    }
  });
  bodyParsers?.forEach((parser) => {
    try {
      parser(body);
    } catch (e) {
      errors.push(e as Error);
    }
  });

  return errors;
};
