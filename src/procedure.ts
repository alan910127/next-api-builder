import type {
  ApiHandler,
  ApiRequest,
  ApiResponse,
  TypedApiRequest,
} from "./handler";
import {
  getParseFunction,
  type AnyParseFunction,
  type AnyParser,
  type InferParser,
} from "./parser";
import { validateRequest } from "./validate";
import { zodErrorFormatter } from "./zodErrorFormatter";

type ErrorFormatter = <E extends Error>(
  errors: E[]
) => (string | Record<string, string>)[];

type ProcedureInner = {
  queryParsers: AnyParseFunction[];
  bodyParsers: AnyParseFunction[];
  formatter: ErrorFormatter;
};

export type Procedure<Query, Body> = {
  /**
   * @internal
   */
  _inner: ProcedureInner;

  /**
   * Add a parser for the request query parameters
   */
  query: <P extends AnyParser>(
    schema: P
  ) => Procedure<Query & InferParser<P>["out"], Body>;

  /**
   * Add a parser for the request body
   */
  body: <P extends AnyParser>(
    schema: P
  ) => Procedure<Query, Body & InferParser<P>["out"]>;

  /**
   * Set a custom error formatter
   */
  errorFormatter: (formatter: ErrorFormatter) => Procedure<Query, Body>;

  /**
   * Define a handler for the endpoint
   */
  handler: (
    cb: (
      req: TypedApiRequest<Query, Body>,
      res: ApiResponse
    ) => unknown | Promise<unknown>
  ) => ApiHandler;
};

const createNewProcedure = <Query, Body>(
  previous: ProcedureInner,
  next: Partial<ProcedureInner>
) => {
  const _inner = {
    ...previous,
    queryParsers: [...previous.queryParsers, ...(next.queryParsers ?? [])],
    bodyParsers: [...previous.bodyParsers, ...(next.bodyParsers ?? [])],
  };
  return createProcedure<Query, Body>(_inner);
};

const createProcedure = <Query, Body>(
  initialState?: ProcedureInner
): Procedure<Query, Body> => {
  const _inner: ProcedureInner = initialState ?? {
    queryParsers: [],
    bodyParsers: [],
    formatter: zodErrorFormatter as ErrorFormatter,
  };

  return {
    _inner,
    query: (schema) => {
      const fn = getParseFunction(schema);
      return createNewProcedure(_inner, {
        queryParsers: [fn],
      });
    },
    body: (schema) => {
      const fn = getParseFunction(schema);
      return createNewProcedure(_inner, {
        bodyParsers: [fn],
      });
    },
    errorFormatter: (formatter) => {
      return createNewProcedure(_inner, {
        formatter,
      });
    },
    handler: (cb) => {
      return (req: ApiRequest, res: ApiResponse) => {
        const errors = validateRequest({
          ..._inner,
          query: req.query,
          body: req.body,
        });

        if (errors.length > 0) {
          return res.status(422).json({
            message: "Invalid request",
            errors: _inner.formatter(errors),
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        return cb(req as any, res);
      };
    },
  };
};

export const procedure = createProcedure();
