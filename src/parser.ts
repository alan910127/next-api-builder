type SyncParseFunction<T> = (data: unknown) => T;
type AsyncParseFunction<T> = (data: unknown) => Promise<T>;
export type ParseFunction<T> = SyncParseFunction<T> | AsyncParseFunction<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyParseFunction = ParseFunction<any>;

type ZodParser<T> = {
  parse: SyncParseFunction<T>;
};

type SuperStructParser<T> = {
  create: SyncParseFunction<T>;
};

type YupParser<T> = {
  validateSync: SyncParseFunction<T>;
};

type JoiParser<T> = {
  validate: SyncParseFunction<T>;
};

type CustomParser<T> = ParseFunction<T>;

export type Parser<T> =
  | ZodParser<T>
  | SuperStructParser<T>
  | YupParser<T>
  | JoiParser<T>
  | CustomParser<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyParser = Parser<any>;

export type InferParser<P extends AnyParser> = P extends Parser<infer T>
  ? { in: T; out: T }
  : never;

export const getParseFunction = <T>(
  inputParser: AnyParser
): ParseFunction<T> => {
  /* eslint-disable 
    @typescript-eslint/no-unsafe-assignment, 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-unsafe-return,
    @typescript-eslint/no-unsafe-member-access,
    @typescript-eslint/no-unsafe-call
  */
  const parser = inputParser as any;

  if (typeof parser === "function") {
    return parser;
  }

  const fields = ["parse", "validateSync", "validate", "create"] as const;

  for (const field of fields) {
    if (typeof parser[field] === "function") {
      return parser[field].bind(parser);
    }
  }

  throw new Error("Invalid parser given");
};
