import { Data } from "effect";

export class YouTubeFetchError extends Data.TaggedError("YouTubeFetchError")<{}> {}
export class ApiRequestError extends Data.TaggedError("ApiRequestError")<{}> {}
export class ApiKeyError extends Data.TaggedError("ApiKeyError")<{}> {}
export class ApiParseError extends Data.TaggedError("ApiParseError")<{}> {}
