import { createEndpoint, procedure } from "@alan910127/next-api-builder";
import { randomUUID } from "crypto";
import { z } from "zod";

export default createEndpoint({
  get: procedure
    .query(
      z.object({
        text: z.string().optional(),
      })
    )
    .handler(async (req, res) => {
      const text = req.query.text ?? "world";
      //               ^?
    }),

  post: procedure
    .body(
      z.object({
        name: z.string(),
        age: z.coerce.number().nonnegative(),
      })
    )
    .handler(async (req, res) => {
      const { name, age } = req.body;
      //                        ^?
      res.status(201).json({
        id: randomUUID(),
        name,
        age,
      });
    }),

  // ...put, delete etc.
});
