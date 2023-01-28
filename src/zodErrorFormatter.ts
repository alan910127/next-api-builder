import type { ZodError } from "zod";

export const zodErrorFormatter = (error: ZodError) => {
  return Object.fromEntries(
    error.errors.map(({ path, message }) => [path.join("."), message])
  );
};

export const bathcZodErrorFormatter = (errors: ZodError[]) => {
  return errors
    .map(zodErrorFormatter)
    .reduce(
      (previousObj, currentObj) => ({ ...previousObj, ...currentObj }),
      {}
    );
};
