
function audioPropertiesToColor(sampleRate, channels, duration, rmsLoudness) {
    // Map sample rate to a hue (0-360)
    const hue = (sampleRate - 22050) / 22050 * 180; // Assuming sample rates range from 22050 to 44100

    // Map RMS loudness to saturation (0-100%)
    const saturation = Math.min(Math.max(rmsLoudness * 1000, 20), 100); // Ensure within bounds and amplify effect

    // Map duration to lightness (0-100%)
    const lightness = 100 - Math.min(duration * 100, 50); // Ensure within bounds, shorter = brighter

    // Convert HSL to RGB (simple conversion for demonstration, consider using a library for accurate conversion)
    const rbg = hslToRgb(hue, saturation, lightness).map(Math.abs)

    return {
        r: rbg[0],
        g: rbg[1],
        b: rbg[2],
    }
}
const hslToRgb = function(hue, saturation, lightness){
    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
    if( hue == undefined ){
      return [0, 0, 0];
    }
  
    let chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    let huePrime = hue / 60;
    let secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
  
    huePrime = Math.floor(huePrime);
    let red;
    let green;
    let blue;
  
    if( huePrime === 0 ){
      red = chroma;
      green = secondComponent;
      blue = 0;
    }else if( huePrime === 1 ){
      red = secondComponent;
      green = chroma;
      blue = 0;
    }else if( huePrime === 2 ){
      red = 0;
      green = chroma;
      blue = secondComponent;
    }else if( huePrime === 3 ){
      red = 0;
      green = secondComponent;
      blue = chroma;
    }else if( huePrime === 4 ){
      red = secondComponent;
      green = 0;
      blue = chroma;
    }else if( huePrime === 5 ){
      red = chroma;
      green = 0;
      blue = secondComponent;
    }
  
    let lightnessAdjustment = lightness - (chroma / 2);
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;
  
    return [Math.round(red % 256), Math.round(green % 256), Math.round(blue % 256)];
  
  };
export { audioPropertiesToColor };