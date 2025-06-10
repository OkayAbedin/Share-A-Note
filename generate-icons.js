const fs = require('fs');
const path = require('path');

// Create a very simple 32x32 favicon.ico file
const generateFavicon = () => {
  // Simple blue square with white lines for the favicon
  const header = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20, 0x00, 0x00, 0x01, 0x00, 
    0x08, 0x00, 0x68, 0x05, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ]);
  
  // Create a very simple color palette (blue background with white text)
  const palette = Buffer.alloc(256 * 4); // RGBX format
  
  // Blue color (main background)
  palette[0] = 59;  // R
  palette[1] = 130; // G
  palette[2] = 246; // B
  palette[3] = 0;   // Reserved
  
  // White color (for text)
  palette[4] = 255; // R
  palette[5] = 255; // G
  palette[6] = 255; // B
  palette[7] = 0;   // Reserved
  
  // Red color (for dot)
  palette[8] = 239; // R
  palette[9] = 68;  // G
  palette[10] = 68; // B
  palette[11] = 0;  // Reserved
  
  // Create pixel data for a 32x32 icon
  const pixels = Buffer.alloc(32 * 32);
  
  // Fill with blue background (color 0 in palette)
  pixels.fill(0);
  
  // Add white lines for text-like appearance (color 1 in palette)
  for (let i = 0; i < 32; i++) {
    // Horizontal lines at different positions
    if (i === 10 || i === 14 || i === 18 || i === 22) {
      for (let j = 8; j < 24; j++) {
        pixels[i * 32 + j] = 1;
      }
    }
  }
  
  // Add red dot in top-right (color 2 in palette)
  for (let i = 7; i < 10; i++) {
    for (let j = 24; j < 27; j++) {
      pixels[i * 32 + j] = 2;
    }
  }
  
  // Combine all parts
  const iconData = Buffer.concat([header, palette, pixels]);
  
  // Write to file
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), iconData);
  console.log('favicon.ico created');
};

// Use existing apple-icon.svg file instead of generating a new one
const useExistingAppleIcon = () => {
  // This function doesn't generate a new icon as we're using the existing apple-icon.svg
  // The file is already in place at: public/apple-icon.svg
  console.log('Using existing apple-icon.svg');
};

// Generate favicon only, use existing apple icon
generateFavicon();
useExistingAppleIcon();
console.log('Icons setup successfully!');
