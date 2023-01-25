import type { ApiHandler, ApiRequest, ApiResponse } from "./handler";

const httpVerbs = [
  "get",
  "head",
  "post",
  "put",
  "delete",
  "connect",
  "options",
  "trace",
  "patch",
] as const;

type HttpVerbs = typeof httpVerbs[number];

type EndpointOptions = {
  [field in HttpVerbs]?: ApiHandler;
};

export const createEndpoint = (routes: EndpointOptions): ApiHandler => {
  return (req: ApiRequest, res: ApiResponse) => {
    const method = req.method?.toLowerCase() as HttpVerbs;
    const handler = routes[method];

    if (handler == null) {
      res.setHeader(
        "Allow",
        Object.keys(routes).map((method) => method.toUpperCase())
      );

      return res
        .status(405)
        .json({ error: `Method ${method.toUpperCase()} Not Allowed` });
    }

    return handler(req, res);
  };
};
