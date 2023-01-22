import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z, type ZodType } from "zod";

export type ApiHandler = NextApiHandler;
export type ApiRequest = NextApiRequest;
export type ApiResponse = NextApiResponse;

export type TypedApiRequest<Query extends ZodType, Body extends ZodType> = Omit<
  ApiRequest,
  "query" | "body"
> & {
  query: z.infer<Query>;
  body: z.infer<Body>;
};
