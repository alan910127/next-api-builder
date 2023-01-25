import type { ZodType } from "zod";
import { formatErrors, validateRequest } from "./error";
import type { ApiHandler, ApiResponse, TypedApiRequest } from "./handler";

type ProcedureInner<Query extends ZodType, Body extends ZodType> = {
  query?: Query;
  body?: Body;
};

export type Procedure<Query extends ZodType, Body extends ZodType> = {
  /**
   * @internal
   */
  _inner: ProcedureInner<Query, Body>;

  /**
   * Add a parser for the request query parameters
   */
  query: <Q extends ZodType>(schema: Q) => Procedure<Q, Body>;

  /**
   * Add a parser for the request body
   */
  body: <B extends ZodType>(schema: B) => Procedure<Query, B>;

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

const createProcedure = <
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
>(
  initialState?: ProcedureInner<Query, Body>
): Procedure<Query, Body> => {
  const _inner = initialState ?? {};

  return {
    _inner,
    query: (schema) => {
      return createProcedure({ ..._inner, query: schema });
    },
    body: (schema) => {
      return createProcedure({ ..._inner, body: schema });
    },
    handler: (cb) => {
      return (req, res) => {
        const parsedRequest = validateRequest<Query, Body>({
          querySchema: _inner.query,
          query: req.query,
          bodySchema: _inner.body,
          body: req.body,
        });

        if (!parsedRequest.success) {
          const formattedErrors = parsedRequest.errors.map((err) =>
            formatErrors(err.format())
          );

          return res.status(422).json({
            error: formattedErrors,
          });
        }

        // FIXME: This won't work without using assertion
        const typedRequest = {
          ...req,
          query: parsedRequest.query,
          body: parsedRequest.body,
        } as TypedApiRequest<Query, Body>;

        return cb(typedRequest, res);
      };
    },
  };
};

export const procedure = createProcedure();
