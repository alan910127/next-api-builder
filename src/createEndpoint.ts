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

type HttpMethod = (typeof httpMethods)[number];

type EndpointOptions = {
  [field in HttpMethod]?: ApiHandler;
};

export const createEndpoint = (routes: EndpointOptions): ApiHandler => {
  return async (req: ApiRequest, res: ApiResponse) => {
    const method = req.method?.toLowerCase() as HttpMethod;
    let handler = routes[method];

    if (method === "head" && handler == null) {
      handler = routes.get;
    }

    if (handler == null) {
      res.setHeader(
        "Allow",
        ["options", ...Object.keys(routes)].map((method) =>
          method.toUpperCase()
        )
      );

      if (method === "options") {
        return res.status(204).end();
      }

      return res
        .status(405)
        .json({ error: `Method ${method.toUpperCase()} Not Allowed` });
    }

    try {
      const result = await handler(req, res);
      res.send(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
};
