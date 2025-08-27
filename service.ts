import { Context, Effect } from "effect";
import ytdl from "ytdl-core";
import {YouTubeFetchError, ApiRequestError, ApiKeyError, ApiParseError} from "./errors";
import {AssemblyAI} from "assemblyai";
import {AppConfig} from "./config.ts";

const getAudioStream = (baseUrl: string) => {
    return Effect.tryPromise({
        try: () => ytdl.getInfo(baseUrl),
        catch: () => new YouTubeFetchError()
    }).pipe(
        Effect.map((info) => {
            return ytdl.downloadFromInfo(info, {
                filter: 'audioonly',
                quality: 'highestaudio'
            })
        })
    )
}

// const streamToBuffer = (audioStream: ReadableStream) => {
//     return Effect.tryPromise({
//         try: (audioStream: ReadableStream) => {
//             const buffer:Buffer[] = []
//             audioStream..on('data', (chunk) => {buffer.push(chunk)})
//         },
//         catch: () => new ApiParseError()
//     })
// }
//
// const ProcessUrl = Effect.gen(function*() {
//     const baseURL = "https://www.youtube.com/live/XOmsrqqtRXE?feature=shared"
//     const audioStream = yield* getAudioStream(baseURL)
//
//
// })

const createTranscription = Effect.tryPromise({
    try:() => {
        const response = fetch('https://api.assemblyai.com/v2/transcript', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": ""
            },
            body: JSON.stringify({"audio_url": "https://www.youtube.com/watch?v=gHv7w4yi49g&pp=ygUbd2Vic29ja2V0IHdpdGggRWZmZWN0IGluIGpz"})
        })
        return response
    },
    catch: () => new YouTubeFetchError()
})

const extractResponse =(response: Response) => Effect.tryPromise({
    try:() => response.json(),
    catch: () => new ApiParseError()
})

const displayOutput = (jsonResponse: unknown) => Effect.try({
    try: () => console.log(jsonResponse),
    catch: () => new Error()
})
export const main = Effect.gen(function* () {
    const response = yield* createTranscription
    const json = yield* extractResponse(response)
    console.log(json)
    displayOutput(json)
})