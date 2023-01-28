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
import { bathcZodErrorFormatter } from "./zodErrorFormatter";

type ErrorFormatter<Err extends Error> = (errors: Err[]) => unknown;

type ProcedureInner<Err extends Error> = {
  queryParsers: AnyParseFunction[];
  bodyParsers: AnyParseFunction[];
  formatter: ErrorFormatter<Err>;
};

type TypedApiHandler<Query, Body> = (
  req: TypedApiRequest<Query, Body>,
  res: ApiResponse
) => unknown | Promise<unknown>;

export type Procedure<Query, Body, Err extends Error> = {
  /**
   * @internal
   */
  _inner: ProcedureInner<Err>;

  /**
   * Add a parser for the request query parameters
   */
  query: <P extends AnyParser>(
    schema: P
  ) => Procedure<Query & InferParser<P>["out"], Body, Err>;

  /**
   * Add a parser for the request body
   */
  body: <P extends AnyParser>(
    schema: P
  ) => Procedure<Query, Body & InferParser<P>["out"], Err>;

  /**
   * Set a custom error formatter
   */
  errorFormatter: <E extends Error>(
    formatter: ErrorFormatter<E>
  ) => Procedure<Query, Body, E>;

  /**
   * Define a handler for the endpoint
   */
  handler: (cb: TypedApiHandler<Query, Body>) => ApiHandler;
};

type InnerWithoutFormatter = Omit<ProcedureInner<Error>, "formatter">;
type InnerFormatter<Err extends Error> = Pick<ProcedureInner<Err>, "formatter">;

const createFormatProcedure = <
  Query,
  Body,
  Err extends Error,
  ErrInput extends Error = Err
>(
  previous: ProcedureInner<Err>,
  next: InnerFormatter<ErrInput>
) => {
  const _inner = { ...previous, formatter: next.formatter };
  return createProcedure<Query, Body, ErrInput>(_inner);
};

const createNewProcedure = <Query, Body, Err extends Error>(
  previous: ProcedureInner<Err>,
  next: Partial<InnerWithoutFormatter>
) => {
  const _inner = {
    ...previous,
    queryParsers: [...previous.queryParsers, ...(next.queryParsers ?? [])],
    bodyParsers: [...previous.bodyParsers, ...(next.bodyParsers ?? [])],
  };
  return createProcedure<Query, Body, Err>(_inner);
};

const createProcedure = <Query, Body, Err extends Error>(
  initialState?: ProcedureInner<Err>
): Procedure<Query, Body, Err> => {
  const _inner: ProcedureInner<Err> = initialState ?? {
    queryParsers: [],
    bodyParsers: [],
    formatter: bathcZodErrorFormatter as unknown as ErrorFormatter<Err>,
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
    errorFormatter: <E extends Error>(formatter: ErrorFormatter<E>) => {
      return createFormatProcedure<Query, Body, Err, E>(_inner, {
        formatter,
      });
    },
    handler: (cb) => {
      return (req: ApiRequest, res: ApiResponse) => {
        const { query, body, errors } = validateRequest<Query, Body, Err>({
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

        return cb({ ...req, query, body } as TypedApiRequest<Query, Body>, res);
      };
    },
  };
};

export const procedure = createProcedure();
