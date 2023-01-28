import type { ZodError } from "zod";

export const zodErrorFormatter = (error: ZodError) => {
  return Object.fromEntries(
    error.errors.map(({ path, message }) => [
      (path.length === 0 ? ["parent"] : path).join("."),
      message,
    ])
  );
};

export const bathcZodErrorFormatter = (errors: ZodError[]) => {
  if (errors.length === 0) return null;
  return errors
    .map(zodErrorFormatter)
    .reduce(
      (previousObj, currentObj) => ({ ...previousObj, ...currentObj }),
      {}
    );
};
