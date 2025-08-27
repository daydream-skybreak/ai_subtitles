import {Context, Layer,Config} from "effect";

export class AppConfig extends Context.Tag("AppConfig")<
    AppConfig,
    {
        readonly assemblyApiKey: string,
        readonly assemblyBaseUrl: string
    }
    >(){}
