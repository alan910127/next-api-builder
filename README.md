# Next.js REST API Builder

A simple, [tRPC](https://trpc.io)-like Next.js RESTful API builder based on [Zod](https://zod.dev) validation

## Table of Contents

- [Installation](#installation)
  - [npm](#npm)
  - [yarn](#yarn)
  - [pnpm](#pnpm)
- [Features](#features)
- [Example Usage](#example-usage)
  - [Caveat](#caveat)
  - [Static Routes](#static-routes)
  - [Dynamic Routes](#dynamic-routes)
  - [Custom Error Formatter](#custom-error-formatter)
- [TODO](#todo)

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

## Features

- Automatic type inference from input schema

- Auto-generated `OPTIONS` request handler according to methods provided

- Auto-generated `HEAD` request handler according to `GET` request handler provided

- Easy to customize error formatter for validation-related error responses
  - You might need to specify your own error formatter if you're not using `zod` to define validation schemas

## Example Usage

### Caveat

If you're using `zod` to define validation schemas, you should always use `z.coerce.{type}()` for **non-string types** instead of using `z.{type}()` directly, or the requests will be rejected due to typing issues.

### Static Routes

```typescript
// pages/api/hello/index.ts

import { createEndpoint, procedure } from "@alan910127/next-api-builder";
import { randomUUID } from "crypto";
import { z } from "zod";

export default createEndpoint({
  get: procedure
    .query(
      z.object({
        text: z.string(),
        age: z.coerce.number().nonnegative().optional(),
      })
    )
    .handler(async ({ query: { text, age } }) => {
      //              ^? (property) query: { age?: number | undefined; text: string; }
      return {
        greeting: `Hello ${text}`,
        age,
      };
    }),
  post: procedure
    .body(
      z.object({
        name: z.string(),
        age: z.coerce.number().nonnegative(),
      })
    )
    .handler(async ({ body: { name, age } }, res) => {
      //              ^? (property) body: { age: number; name: string; }

      // Create some records in datebase...
      res.status(201);
      return {
        id: randomUUID(),
        name,
        age,
      };
    }),

  // ...put, delete etc.
});
```

#### Example Response

- GET without parameters:

  ```
  GET http://localhost:3000/api/hello
  ```

  Status: 422 Unprocessable Entity

  ```json
  {
    "message": "Invalid request",
    "errors": {
      "query": {
        "text": "Required"
      }
    }
  }
  ```

- GET with required parameters:

  ```
  GET http://localhost:3000/api/hello?text=Next.js
  ```

  Status: 200 OK

  ```json
  {
    "greeting": "Hello Next.js"
  }
  ```

- GET with incorrect optional paramters:

  ```
  GET http://localhost:3000/api/hello?text=Next.js&age=test
  ```

  Status: 422 Unprocessable Entity

  ```json
  {
    "message": "Invalid request",
    "errors": {
      "query": {
        "age": "Expected number, received nan"
      }
    }
  }
  ```

- GET with correct parameters:

  ```
  GET http://localhost:3000/api/hello?text=Next.js&age=18
  ```

  Status: 200 OK

  ```json
  {
    "greeting": "Hello Next.js",
    "age": 18
  }
  ```

- GET with extra parameters:

  ```
  http://localhost:3000/api/hello?text=Next.js&age=18&extra=param
  ```

  Status: 200 OK

  ```json
  {
    "greeting": "Hello Next.js",
    "age": 18
  }
  ```

- POST with empty body

  ```
  POST http://localhost:3000/api/hello
  ```

  Status: 422 Unprocessable Entity

  - Without header `Content-Type: application/json`

    ```json
    {
      "message": "Invalid request",
      "errors": {
        "body": {
          "parent": "Expected object, received string"
        }
      }
    }
    ```

  - With header `Content-Type: application/json`

    ```json
    {
      "message": "Invalid request",
      "errors": {
        "body": {
          "name": "Required",
          "age": "Expected number, received nan"
        }
      }
    }
    ```

- POST with correct body

  ```
  POST http://localhost:3000/api/hello
  ```

  ```json
  {
    "name": "Next.js",
    "age": "18"
  }
  ```

  Status: 201 Created

  ```json
  {
    "id": "8a9ebe33-f967-4e6d-8780-eb992e8ddd24",
    "name": "Next.js",
    "age": 18
  }
  ```

### Dynamic Routes

```typescript
// pages/api/hello/[userId].ts

import { createEndpoint, procedure } from "@alan910127/next-api-builder";
import { z } from "zod";

const routeProcedure = procedure.query(
  z.object({
    userId: z.string().uuid("Should be uuid"),
  })
);

export default createEndpoint({
  get: routeProcedure
    .query(
      z.object({
        name: z.string().optional(),
      })
    )
    .handler(async ({ query: { userId, name } }) => {
      //              ^? (property) query: { userId: string; } & { name?: string | undefined; }
      const username = name ?? userId;
      return `Hello ${userId}, your name is ${username}.`;
    }),
});
```

#### Example Response

- GET with incorrect fields with custom error message in zod schema

  ```
  GET http://localhost:3000/api/hello/test
  ```

  ```json
  {
    "message": "Invalid request",
    "errors": {
      "query": {
        "userId": "Should be uuid"
      }
    }
  }
  ```

- GET with correct fields

  ```
  GET http://localhost:3000/api/hello/8a9ebe33-f967-4e6d-8780-eb992e8ddd24?name=Next.js
  ```

  Status: 200 OK

  ```
  Hello 8a9ebe33-f967-4e6d-8780-eb992e8ddd24, your name is Next.js.
  ```

### Custom Error Formatter

```typescript
import { createEndpoint, procedure } from "@alan910127/next-api-builder";

const formattedProcedure = procedure.errorFormatter(() => "there's an error!");

export default createEndpoint({
  get: formattedProcedure // <-- here!
    .query(...)
    .handler(...)
    // ...
});
```

## TODO

- Add support openapi generation
- Add support for middlewares
- Automatic coercion for primitives
