import { spawn } from "child_process";
import { Worker } from "worker_threads";

const VIDEO_URL = "https://www.youtube.com/watch?v=JGwWNGJdvx8";

const worker = new Worker("./transcriber.js");

async function streamYouTubeAudio(url: string) {
    try {
        console.log("Starting two-stage stream with yt-dlp and ffmpeg...");

        const ytDlpPath = "yt-dlp"; // Assuming it's in your PATH
        const ffmpegPath = "ffmpeg"; // Assuming it's in your PATH

        const ytDlpArgs = [
            '--format', 'bestaudio', // Get the best audio stream
            '-o', '-', // Pipe the output to stdout
            url,
        ];

        const ffmpegArgs = [
            '-i', 'pipe:0', // Read input from stdin
            '-f', 'adts',
            '-acodec', 'aac',
            'pipe:1', // Pipe the transcoded output to stdout
        ];

        const ytDlpProcess = spawn(ytDlpPath, ytDlpArgs);
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        console.log("Processes spawned. Piping output...");

        ytDlpProcess.stdout.pipe(ffmpegProcess.stdin);

        const stream = ffmpegProcess.stdout;

        if (!stream) {
            throw new Error("Could not create stream from ffmpeg process.");
        }

        let counter = 0;
        stream.on("data", (chunk) => {
            console.log(`Sending chunk ${++counter}`);
            worker.postMessage(chunk);
        });

        stream.on("end", () => {
            console.log('Stream ended.');
            worker.postMessage("END");
        });

        stream.on("error", (err) => {
            console.error("Stream Error:", err);
        });

        // Debugging: Log any errors from the child processes
        ytDlpProcess.stderr.on('data', (data) => {
            console.error(`yt-dlp stderr: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`ffmpeg stderr: ${data}`);
        });

        // Handle process exits
        ytDlpProcess.on("close", (code) => {
            console.log(`yt-dlp process exited with code ${code}`);
        });

        ffmpegProcess.on("close", (code) => {
            console.log(`ffmpeg process exited with code ${code}`);
        });

    } catch (err) {
        console.error("Error fetching YouTube audio:", err);
    }
}

streamYouTubeAudio(VIDEO_URL);