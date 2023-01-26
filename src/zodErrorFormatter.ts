import type { ZodError } from "zod";

export const zodErrorFormatter = (errors: ZodError<Map<string, string>>[]) => {
  return errors
    .map(
      (error) =>
        Object.entries(error.format())
          .map(([field, value]) => {
            if (
              field === "_errors" &&
              Array.isArray(value) &&
              value.length > 0
            ) {
              return value;
            }
            if (value && "_errors" in value) {
              return { [field]: value._errors.join(", ") };
            }
          })
          .flat()
          .filter(Boolean) as Record<string, string>[]
    )
    .flat();
};
