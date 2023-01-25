import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export type ApiHandler = NextApiHandler;
export type ApiRequest = NextApiRequest;
export type ApiResponse = NextApiResponse;

export type TypedApiRequest<Query, Body> = Omit<
  ApiRequest,
  "query" | "body"
> & {
  query: Query;
  body: Body;
};
