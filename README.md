# Next.js REST API Builder

A simple, [tRPC](https://trpc.io)-like Next.js RESTful API builder based on [Zod](https://zod.dev) validation

## Installation

### Requirements

- Requirements of [Zod](https://github.com/colinhacks/zod#requirements)
  - TypeScript 4.5+
  - Make sure you enabled `strict` in your `tsconfig.json`.
- Next.js

### `npm`

```bash
npm install @alan910127/next-api-builder
```

### `yarn`

```bash
yarn add @alan910127/next-api-builder
```

### `pnpm`

```bash
pnpm add @alan910127/next-api-builder
```

## Example Usage

Create an endpoint in the `[/src]/pages/api` directory

```typescript
// pages/api/hello.ts
import { randomUUID } from "crypto";
import { z } from "zod";
import { createEndpoint, procedure } from "@alan910127/next-api-builder";

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

## TODO

- Add support for multiple input validation schemas
  (For path parameters in dynamic routes or common input)
- Add support for middlewares
