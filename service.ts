import { Context, Effect } from "effect";
import ytdl from "ytdl-core";
import {YouTubeFetchError, ApiRequestError, ApiKeyError, ApiParseError} from "./errors";

export const getAudioService = (
    url: string
)=> {
    return Effect.tryPromise(async () => {
        try {
            const chunks: Buffer[] = [];

            const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

            return await new Promise<Buffer>((resolve, reject) => {
                stream.on("data", (chunk) => chunks.push(chunk));

                stream.on("end", () => resolve(Buffer.concat(chunks)));

                stream.on("error", (err) =>
                    reject(
                        new YouTubeFetchError()
                )
            });
        } catch (err: any) {
            throw new YouTubeFetchError({
                url,
                reason: err.message ?? "Unexpected error",
            });
        }
    });
};

export const makeTranscriptionService = (opts: {
    baseUrl: string;
    apiKey: string;
    /** e.g. "audio/webm", "audio/mpeg", "audio/wav" */
    contentType?: string;
}) => {
    const { baseUrl, apiKey, contentType = "application/octet-stream" } = opts;

    return {
        processAudio: (audioData: Buffer): Effect.Effect<
            never,
            YouTubeFetchError | ApiKeyError | ApiRequestError | ApiParseError,
            unknown
        > =>
            Effect.gen(function* ($) {
                // 1) Basic API key check
                if (!apiKey || apiKey.trim().length === 0) {
                    yield* $(
                        Effect.fail(
                            new ApiKeyError({
                                message: "Missing API key for transcription service",
                            })
                        )
                    );
                }

                // 2) Do the API request
                const response = yield* $(
                    Effect.tryPromise({
                        try: async () =>
                            await fetch(`${baseUrl}/transcribe`, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${apiKey}`,
                                    "Content-Type": contentType,
                                },
                                body: audioData,
                            }),
                        catch: (e: unknown) =>
                            new ApiRequestError({
                                status: 0,
                                message:
                                    e instanceof Error
                                        ? e.message
                                        : "Network error",
                            }),
                    })
                );

                // 3) Non-2xx → ApiRequestError
                if (!response.ok) {
                    const text = await response.text().catch(() => "");
                    yield* $(
                        Effect.fail(
                            new ApiRequestError({
                                status: response.status,
                                message: text || `HTTP ${response.status}`,
                            })
                        )
                    );
                }

                // 4) Parse JSON
                const json = yield* $(
                    Effect.tryPromise({
                        try: async () => await response.json(),
                        catch: (e: unknown) =>
                            new ApiParseError({
                                raw: null,
                                message:
                                    e instanceof Error
                                        ? e.message
                                        : "Invalid JSON response",
                            }),
                    })
                );

                // 5) Validate against schema
                const parsed = yield* $(
                    S.parse(TranscriptionResponseSchema)(json).pipe(
                        Effect.mapError(
                            (err) =>
                                new ApiParseError({
                                    raw: json,
                                    message: String(err),
                                })
                        )
                    )
                );

                return parsed;
            }),
    };
};
