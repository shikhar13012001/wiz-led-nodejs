import { discover } from "wikari";
import { spawn } from "child_process";
import chalk from "chalk";
import TaskQueue from "./lib/microTaskQ.js";
import { AudioContext } from "web-audio-api";
import { audioPropertiesToColor } from "./lib/utils.js";
const queue = new TaskQueue(1); // Use a single task queue for clarity

// Function to decode audio data asynchronously
async function decodeAudioData(audioContext, audioData) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(audioData, resolve, reject);
  });
}

// Async function to process the audio file
async function processAudioFile(stream) {
  const audioContext = new AudioContext();

  try {
    // Load your audio file

    // Decode the audio data
    const audioBuffer = await decodeAudioData(audioContext, stream);

    // Sample Rate
    console.log(`Sample Rate: ${audioBuffer.sampleRate} Hz`);

    // Channels
    console.log(`Channels: ${audioBuffer.numberOfChannels}`);

    // Duration
    console.log(`Duration: ${audioBuffer.duration} seconds`);

    // Calculate Loudness (RMS)
    let sumOfSquares = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      const sample = audioBuffer.getChannelData(0)[i]; // Using the first channel for simplicity
      sumOfSquares += sample * sample;
    }
    const rms = Math.sqrt(sumOfSquares / audioBuffer.length);
    console.log(`Loudness (RMS): ${rms}`);
    return audioBuffer;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Improved function name for clarity
async function controlSmartBulb() {
  const bulbs = await discover({ addr: "192.168.137.208" }); // Simplified import and removed unnecessary comment
  if (bulbs.length === 0) {
    console.log("No bulbs found!");
    process.exit(1); // Exit the process if no bulbs are found
  }
  const bulb = bulbs[0];
  console.log(await bulb.getPilot()); // Simplified logging
  bulb.onMessage(console.log); // Log any message from the bulb
  bulb.brightness(100); // Set the brightness to 100%

  try {
    // await bulb.white(10000); // Use a clear value for color temperature
    const childProcess = spawn("fmedia", [
      "--record",
      "--dev-loopback=0",
      "-o",
      "@stdout.wav",
    ]);
    childProcess.stdout.on("data", (data) => {
      queue.enqueue(() => handleAudioData(data, bulb));
    });
    childProcess.stderr.on("data", (data) =>
      console.error("stderr data ->", data.toString())
    );
    childProcess.on("close", (code) =>
      console.log(`Child process exited with code ${code}`)
    );
  } catch (error) {
    console.error("Error controlling the bulb:", error);
  }
}

async function handleAudioData(data, bulb) {
  const bufferData = await processAudioFile(data);
  const colors = await bufferToColor(data, bufferData);
  for (let color of colors) {
    try {
      console.log(color); // Log the color for debugging
      console.log(chalk.rgb(color.r, color.g, color.b)("█")); // Use chalk to log colored blocks
      if (color.r < 10 && color.g < 10 && color.b < 10) {
        continue;
      }
      await bulb.color(color);
      await delay(300);
    } catch (error) {
      console.error(error);
      // If an error occurs, stop the run node index.js in terminal and restart it
      process.exit(1); // Restart the main function
    }
  }
}

async function bufferToColor(stream, bufferData) {
  let sumOfSquares = 0;
 const colors = [];
  for (let i = 0; i < bufferData.length; i++) {
    const sample = bufferData.getChannelData(0)[i]; // Using the first channel for simplicity
    sumOfSquares += sample * sample;
    let _rms= Math.sqrt(sumOfSquares / (i+1));
    colors.push(audioPropertiesToColor(
      bufferData.sampleRate+(i*1000)%22050,
      bufferData.numberOfChannels,
      bufferData.duration,
      _rms
    ));
  }
  const rms = Math.sqrt(sumOfSquares / bufferData.length);
  colors.push(audioPropertiesToColor(
    bufferData.sampleRate,
    bufferData.numberOfChannels,
    bufferData.duration,
    rms
  ));
  return colors;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

controlSmartBulb(); // Execute the main function
