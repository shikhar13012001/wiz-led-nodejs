const SpotifyWebApi = require('spotify-web-api-node');
const { discover } = require ("wikari");
const express = require('express');
const app = express();
const port = 3000;

// Replace these with your actual Spotify App credentials

let colorUpdateInterval;

// Function to simulate dynamic color changes based on the song's segments
async function simulateDynamicColorChanges(trackDurationMs, bulb) {
  const segmentDurationMs = 30000; // Example: update color every 30 seconds
  const numberOfSegments = Math.floor(trackDurationMs / segmentDurationMs);
  let currentSegment = 0;

  // Clear any existing interval to prevent multiple intervals running simultaneously
  if (colorUpdateInterval) clearInterval(colorUpdateInterval);

  colorUpdateInterval = setInterval(() => {
    if (currentSegment >= numberOfSegments) {
      clearInterval(colorUpdateInterval); // Stop the interval once we've covered the whole track
      return;
    }

    // Simulate color change logic here
    // For a real implementation, you'd derive these from the track's audio features and segment number
    const simulatedColor = simulateColorForSegment(currentSegment, numberOfSegments);
    bulb.color(simulatedColor); // Update the bulb's color
    console.log('Updated color for segment:', currentSegment, 'to', simulatedColor);

    currentSegment++;
  }, segmentDurationMs);
}

// Placeholder function for simulating color based on segment
function simulateColorForSegment(segment, totalSegments) {
    // Simple linear interpolation for color variation across segments in HEX
    const startColor = { r: 0xFF, g: 0x00, b: 0x00 }; // Red
    const endColor = { r: 0x00, g: 0x00, b: 0xFF }; // Blue
    const r = Math.floor(interpolate(startColor.r, endColor.r, segment / totalSegments)).toString(16).padStart(2, '0');
    const g = Math.floor(interpolate(startColor.g, endColor.g, segment / totalSegments)).toString(16).padStart(2, '0');
    const b = Math.floor(interpolate(startColor.b, endColor.b, segment / totalSegments)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  function interpolate(start, end, fraction) {
    return start + (end - start) * fraction;
  }
  



const spotifyApi = new SpotifyWebApi({
  clientId: '4cb55a19f1f2454a92186d51c11fb5e1',
  clientSecret: 'c59da673e670454a90aa428ad80e4f91',
  redirectUri: 'http://localhost:3000/callback',
});

let currentTrackId = null;
// Placeholder for your smart bulb's discovery method
async function discoverBulbs() {
  // Simulate discovering bulbs
  // In a real scenario, you'd use your bulb's SDK or API for discovery

  const bulbs = await discover({addr: '192.168.137.208'});
    return bulbs;
}

async function updateBulbColor() {
    try {
      const bulbs = await discoverBulbs();
      if (bulbs.length === 0) {
        console.log("No bulbs found!");
        return;
      }
      const bulb = bulbs[0];
  
      const nowPlaying = await spotifyApi.getMyCurrentPlayingTrack();
      if (!nowPlaying.body.is_playing) {
        console.log("No music is playing on Spotify.");
        return;
      }
  
      // Check if the track has changed since the last update
      if (nowPlaying.body.item.id !== currentTrackId) {
        currentTrackId = nowPlaying.body.item.id; // Update current track ID
  
        const features = await spotifyApi.getAudioFeaturesForTrack(currentTrackId);
        const bulbColor = getColorFromAudioFeatures(features.body);
  
        // Assuming your bulb has a method to set color
        await bulb.color(bulbColor);
        console.log('Color set to', bulbColor, 'for track:', nowPlaying.body.item.name);
      }
    } catch (error) {
      console.error('Error updating bulb color:', error);
    }
  }
// Function to convert audio features to a color (simplified example)
function getColorFromAudioFeatures(features) {
    // Normalize audio feature values
    const energy = features.energy;
    const valence = features.valence;
    const danceability = features.danceability;
  
    // Generate a base color using the audio features
    let baseColor = {
      r: Math.floor(energy * 255),
      g: Math.floor(valence * 255),
      b: Math.floor(danceability * 255),
    };
  
    // Introduce randomness
    // Adjust the factor to control the degree of randomness
    const randomFactor = 0.5; // Adjust this factor to increase or decrease the randomness
  
    let color = {
      r: (baseColor.r + Math.floor(Math.random() * 255 * randomFactor)) % 255,
      g: (baseColor.g + Math.floor(Math.random() * 255 * randomFactor)) % 255,
      b: (baseColor.b + Math.floor(Math.random() * 255 * randomFactor)) % 255,
    };
  
    // Optionally, convert to a more visually appealing color space and back to RGB
    // For instance, adjusting saturation and lightness in HSL could yield more vibrant colors
  
    return color;
  }
  

// Authentication route to request authorization from Spotify
app.get('/login', (req, res) => {
  const scopes = ['user-read-currently-playing', 'user-read-playback-state'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback route for Spotify to redirect to after authorization
app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  if (error) {
    console.error(`Callback Error: ${error}`);
    res.send(`Callback Error: ${error}`);
    return;
  }
  
  spotifyApi.authorizationCodeGrant(code).then(data => {
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.send('Success! You can now close this window.');
  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
  });
});

// Main route to sync bulb with Spotify
app.get('/sync-bulb', async (req, res) => {
  try {
    const bulbs = await discoverBulbs();
    if (bulbs.length === 0) {
      return res.send("No bulbs found!");
    }
    const bulb = bulbs[0];

    const nowPlaying = await spotifyApi.getMyCurrentPlayingTrack();
    console.log(nowPlaying)
    if (nowPlaying.body.is_playing) {
  const trackDurationMs = nowPlaying.body.item.duration_ms;
  simulateDynamicColorChanges(trackDurationMs, bulb);
} 
    const features = await spotifyApi.getAudioFeaturesForTrack(nowPlaying.body.item.id);
    const bulbColor = getColorFromAudioFeatures(features.body);
    
    // Assuming your bulb has a setColor method
    await bulb.color(bulbColor);
    console.log('color set to', bulbColor);
    res.send(`Bulb color set to based on the currently playing track: ${nowPlaying.body.item.name}`);
  } catch (error) {
    console.error('Error in /sync-bulb:', error);
    res.send('Failed to sync bulb with Spotify.');
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    // Start polling Spotify for the current track every 30 seconds
    setInterval(updateBulbColor, 300); // Adjust the interval as needed
  });
