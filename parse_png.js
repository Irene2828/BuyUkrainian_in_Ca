const fs = require('fs');

function readPNG(filename) {
  const buffer = fs.readFileSync(filename);
  // Just parsing the pixel data of a PNG manually is complex. Let's just install an image parser in a tmp dir.
}
