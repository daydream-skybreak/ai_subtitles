import { parentPort } from "worker_threads";
import fs from "fs";
import { createClient } from "@deepgram/sdk";

const DEEPGRAM_API_KEY = "";
const deepgram = createClient(DEEPGRAM_API_KEY);

const connection = deepgram.listen.live({
    model: "nova-3",
    punctuate: true,
    smart_format: true,
    interim_results: false,
});

let subtitleIndex = 1;
const srtStream = fs.createWriteStream("transcript.srt");
console.log('this worker is active and running')
connection.on("transcriptReceived", (msg: any) => {
    console.log('transcription received', typeof msg)
    console.log(msg)
    const alt = msg.channel.alternatives[0];
    console.log(alt)
    if (!alt.words) return;

    alt.words.forEach((w: any) => {
        const startTime = new Date(w.start * 1000).toISOString().substr(11, 12).replace('.', ',');
        const endTime = new Date(w.end * 1000).toISOString().substr(11, 12).replace('.', ',');
        srtStream.write(`${subtitleIndex}\n${startTime} --> ${endTime}\n${w.word} (conf: ${w.confidence.toFixed(2)})\n\n`);
        subtitleIndex++;
    });
});

connection.on("error", (err) => console.error(err));

parentPort?.on("message", (data: any) => {
    if (data === "END") {
        connection.finish();
        srtStream.end();
    } else {
        console.log('receiving message')
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.length);
        console.log(arrayBuffer)
        connection.send(arrayBuffer);
    }
});
