import ytdl from "ytdl-core";
import * as fs from "node:fs";
import {createClient, DeepgramClient} from '@deepgram/sdk'

async function downloadYouTubeAudio(url, outputPath) {
    try {
        if (!ytdl.validateURL(url)) {
            throw new Error("Invalid YouTube URL");
        }

        console.log("Fetching audio...");

        // Get audio-only stream
        const audioStream = ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
        });
        audioStream.on('data', data => {
            const client = createClient('');
            const { result, error } = await client.listen.prerecorded.transcribeUrl(
                { url: "https://youtu.be/8d_-_N95zG0" },
                {
                    model: "nova-3",
                    // pre-recorded transcription options
                }
            );
            return result
        })
        // Pipe to file
        audioStream.pipe(fs.createWriteStream(outputPath));

        audioStream.on("end", () => {
            console.log("Audio downloaded successfully:", outputPath);
        });

        audioStream.on("error", (err) => {
            console.error("Error while downloading:", err);
        });
    } catch (err) {
        console.error("Failed to download audio:", err.message);
    }
}

// Example usage:
downloadYouTubeAudio(
    "https://www.youtube.com/watch?v=jQpJJrZGQ5Q",
    "./audio.mp3"
).then(res => console.log(res));