import { ApiHandler, ApiRequest, ApiResponse } from "./handler";
import { Procedure } from "./procedure";

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

type ApiRoutes = {
  [field in HttpVerbs]?: Procedure;
};

export const createEndpoint = (routes: ApiRoutes): ApiHandler => {
  return (req: ApiRequest, res: ApiResponse) => {
    const method = req.method?.toLowerCase() as HttpVerbs;
    const route = routes[method];

    if (route == null) {
      res.setHeader(
        "Allow",
        Object.keys(routes).map((method) => method.toUpperCase())
      );

      return res
        .status(405)
        .json({ error: `Method ${method.toUpperCase()} Not Allowed` });
    }

    const { handler } = route._inner;

    return handler(req, res);
  };
};
