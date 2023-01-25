# Next.js REST API Builder

A simple, [tRPC](https://trpc.io)-like Next.js RESTful API builder based on [Zod](https://zod.dev) validation

## Installation

> Zod is now removed from the dependency, as a result, you need to install zod manually or choose any validation library as you desired.
>
> :warning: This package is still built with zod, the other libraries are not tested :warning:

### `npm`

```bash
npm install @alan910127/next-api-builder zod
```

### `yarn`

```bash
yarn add @alan910127/next-api-builder zod
```

### `pnpm`

```bash
pnpm add @alan910127/next-api-builder zod
```

## Quick Start

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
        age: z.coerce.number().nonnegative(),
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

## Warning

If you're using `zod`, you should always use `z.coerce.{type}()` for non-string types instead of using `z.{type}()` directly, or the requests will be rejected due to typing issues.

## TODO

- Add support for multiple input validation schemas
  (For path parameters in dynamic routes or common input)
- Add support for middlewares
- Automatic coercion for primitives
