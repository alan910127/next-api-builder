# Next.js API Builder

A simple, [tRPC](https://trpc.io)-like Next.js RESTful API builder based on [Zod](https://zod.dev) validation

## Example Usage

First define your endpoint in the `[/src]/pages/api` directory

```typescript
// pages/api/hello.ts
import { randomUUID } from "crypto";
import { z } from "zod";
import { createEndpoint, procedure } from ".";

export default createEndpoint({
  get: procedure
    .query(
      z.object({
        text: z.string().optional(),
      })
    )
    .handler(async (req, res) => {
      const text = req.query.text ?? "world";
      //               ^? (property): query: { text?: string | undefined; }
      res.status(200).send(`Hello ${text}`);
    }),

  post: procedure
    .body(
      z.object({
        name: z.string(),
        age: z.number().nonnegative(),
      })
    )
    .handler(async (req, res) => {
      const { name, age } = req.body;
      //                        ^? (property): body: { name: string; age: number; }
      res.status(201).json({
        id: randomUUID(),
        name,
        age,
      });
    }),

  // ...put, delete etc.
});
```

Then you can access the endpoint with validation applied!
