import {Effect, Console} from "effect";

const main: Effect.Effect<void> = Console.log(" Hellow world")

Effect.runSync(main)