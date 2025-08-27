import { Worker } from "worker_threads";
import play from "play-dl";

const VIDEO_URL = "https://www.youtube.com/watch?v=822gBEAAD1I";

const worker = new Worker("./transcriber.js");

async function streamYouTubeAudio(url: string) {
    try {
        const info = await play.video_info(url);
        console.log(info.video_details.url)
        const stream = await play.stream_from_info(info);
        console.log('here i am')
        stream.stream.on("data", (chunk) => worker.postMessage(chunk));
        stream.stream.on("end", () => worker.postMessage("END"));
        stream.stream.on("error", (err) => console.error(err));

    } catch (err) {
        console.error("Error fetching YouTube audio:", err);
    }
}

streamYouTubeAudio(VIDEO_URL);
