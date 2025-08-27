import {Config, Layer, Effect} from "effect"
import {AppConfig} from "./config.ts";

const AppConfigLive = Layer.effect(
    AppConfig,
    Effect.gen(function*(){
        const assemblyApiKey = yield* Config.string('ASSEMBLYAI_API_KEY')
        const assemblyBaseUrl = yield* Config.string('ASSEMBLYAI_BASEURL')
        return { assemblyApiKey, assemblyBaseUrl }
    })
)