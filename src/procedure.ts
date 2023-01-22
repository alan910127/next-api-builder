import { NextApiHandler } from "next";
import { ZodType } from "zod";
import { ApiResponse, TypedApiRequest } from "./handler";

type ProcedureInner<
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
> = {
  query?: Query;
  body?: Body;
  handler: NextApiHandler;
};

export type Procedure<
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
> = {
  _inner: ProcedureInner<Query, Body>;
  query: <Q extends ZodType>(schema: Q) => Procedure<Q, Body>;
  body: <B extends ZodType>(schema: B) => Procedure<Query, B>;
  handler: (
    cb: (
      req: TypedApiRequest<Query, Body>,
      res: ApiResponse
    ) => unknown | Promise<unknown>
  ) => Procedure<Query, Body>;
};

const createProcedure = <
  Query extends ZodType = ZodType,
  Body extends ZodType = ZodType
>(
  initialState?: ProcedureInner<Query, Body>
): Procedure<Query, Body> => {
  const _inner = initialState ?? {
    handler: (_req, _res) => {},
  };

  return {
    _inner,
    query: <QueryInput extends ZodType>(schema: QueryInput) => {
      return createProcedure<QueryInput, Body>({ ..._inner, query: schema });
    },
    body: <BodyInput extends ZodType>(schema: BodyInput) => {
      return createProcedure<Query, BodyInput>({ ..._inner, body: schema });
    },
    handler: (cb) => {
      return createProcedure<Query, Body>({
        ..._inner,
        handler: (req, res) => {
          const { query, body } = _inner;
          const typedRequest = { ...req } as TypedApiRequest<Query, Body>;

          const error = [];

          if (query != null) {
            const parsedQuery = query.safeParse(req.query);
            if (!parsedQuery.success) {
              error.push(parsedQuery.error);
            } else {
              typedRequest.query = parsedQuery.data;
            }
          }

          if (body != null) {
            const parsedBody = body.safeParse(req.body);
            if (!parsedBody.success) {
              error.push(parsedBody.error);
            } else {
              typedRequest.body = parsedBody.data;
            }
          }

          if (error.length > 0) {
            return res.status(422).json({ error });
          }

          return cb(typedRequest, res);
        },
      });
    },
  };
};

export const procedure = createProcedure();
