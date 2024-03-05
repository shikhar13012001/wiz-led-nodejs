import { discover } from "wikari";
import { spawn } from 'child_process';
import chalk from "chalk";
import TaskQueue from "./lib/microphone.js";


const queue = new TaskQueue(1); // Use a single task queue for clarity

// Improved function name for clarity
async function controlSmartBulb() {
    const bulbs = await discover({ addr: '192.168.137.208' }); // Simplified import and removed unnecessary comment
    if (bulbs.length === 0) {
        return console.log("No bulbs found!");
    } 
    const bulb = bulbs[0];
    console.log(await bulb.getPilot()); // Simplified logging
    bulb.onMessage(console.log); // Log any message from the bulb
    bulb.brightness(100); // Set the brightness to 100%
    
    
    

    try {
       // await bulb.white(10000); // Use a clear value for color temperature
        const childProcess = spawn('fmedia', ['--record', '--dev-loopback=0', '-o', '@stdout.wav']);

        childProcess.stdout.on('data',  data => {
            queue.runTask(() => handleAudioData(data, bulb));
        });
        childProcess.stderr.on('data', data => console.error('stderr data ->', data.toString()));
        childProcess.on('close', code => console.log(`Child process exited with code ${code}`));
    } catch (error) {
        console.error('Error controlling the bulb:', error);
    }
}

async function handleAudioData(data, bulb) {
    const colors = bufferToColor(data);
    for (let color of colors) {
        try {
            console.log(color); // Log the color for debugging
            console.log(chalk.rgb(color.r, color.g, color.b)('█')); // Use chalk to log colored blocks
            if (color.r < 10 && color.g < 10 && color.b < 10) {
               
                continue;
            }
            await bulb.color(color);
            await delay(300); 
        } catch (error) {
            console.error(error);
           queue.stop();
            // If an error occurs, stop the run node index.js in terminal and restart it
            process.exit(1) // Restart the main function
        }
    }
}

function bufferToColor(stream) {
    return Array.from(Buffer.from(stream), number => ({ r: 255, g: (number*2)%256, b: (number*3)%256 }));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

controlSmartBulb(); // Execute the main function
