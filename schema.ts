import {Schema} from "effect";

export const TranscriptionApiConfigSchema = Schema.Struct({
    baseUrl: Schema.String,
    apiKey: Schema.String.pipe(Schema.nonEmptyString()),
});
export class TranscriptionResponse extends Schema.Class<TranscriptionResponse>("TranscriptionResponse")({
    transcription: Schema.String,
    confidence: Schema.Number
}){}
export class SubtitleToken extends Schema.Class<SubtitleToken>("SubtitleToken")({
    id: Schema.Number,
    value: Schema.String,
    startTimeMs: Schema.Number,
    endTimeMs: Schema.Number,
    score: Schema.Number,
}) {}
