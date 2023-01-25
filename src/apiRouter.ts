import type { ApiHandler, ApiRequest, ApiResponse } from "./handler";

const httpMethods = [
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

type HttpMethod = typeof httpMethods[number];

type EndpointOptions = {
  [field in HttpMethod]?: ApiHandler;
};

export const createEndpoint = (routes: EndpointOptions): ApiHandler => {
  return (req: ApiRequest, res: ApiResponse) => {
    const method = req.method?.toLowerCase() as HttpMethod;
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
