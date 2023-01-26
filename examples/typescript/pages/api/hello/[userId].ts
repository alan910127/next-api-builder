import { createEndpoint, procedure } from "@alan910127/next-api-builder";
import { z } from "zod";

const routeProcedure = procedure.query(
  z.object({
    userId: z.string().uuid(),
  })
);

export default createEndpoint({
  get: routeProcedure
    .query(
      z.object({
        name: z.string().optional(),
      })
    )
    .handler(async (req, res) => {
      const { userId, name } = req.query;
      //                           ^?
      const username = name ?? userId;
      res.status(200).send(`Hello ${userId}, your name is ${username}.`);
    }),
});
