# Wiz LED Control Node.js

Control your Wiz smart bulbs with audio! `wiz-led-control-nodejs` is a Node.js application that listens to audio input, processes it to determine its characteristics like sample rate, channels, duration, and loudness, and then changes the color of your Wiz smart bulbs based on these audio properties.

## Features

- Discover Wiz bulbs on your network.
- Process audio input in real-time.
- Change bulb colors based on the audio's sample rate, channels, duration, and loudness.

## Installation

Before installing, ensure you have Node.js and npm (Node Package Manager) installed on your system.

1. Clone the repository to your local machine.
   ```
   git clone https://github.com/yourusername/wiz-led-control-nodejs.git
   ```
2. Navigate to the cloned directory.
   ```
   cd wiz-led-control-nodejs
   ```
3. Install the required dependencies.
   ```
   npm install
   ```

## Usage

To start controlling your Wiz bulbs with audio, run the following command in the terminal:
```
node index.js
```

Ensure your computer's audio input is set up correctly to capture the desired audio source.

## How It Works

1. The application uses the `wikari` library to discover Wiz bulbs on the network.
2. It then starts capturing audio using the `fmedia` command and processes this audio in real-time.
3. For each chunk of audio data, the application calculates various audio properties and maps these to colors.
4. The Wiz bulb colors are then updated in real-time based on the audio input, creating an immersive audio-visual experience.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
