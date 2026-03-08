const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('../client/public/assets/logo-main.png')
  .pipe(new PNG())
  .on('parsed', function () {
    const reds = {};
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
        var r = this.data[idx];
        var g = this.data[idx + 1];
        var b = this.data[idx + 2];
        var a = this.data[idx + 3];
        if (a > 50 && r > 150 && g < 100 && b < 100) {
          let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
          reds[hex] = (reds[hex] || 0) + 1;
        }
      }
    }
    const sorted = Object.keys(reds).sort((a, b) => reds[b] - reds[a]);
    console.log("Top red colors:");
    console.log(sorted.slice(0, 5).map(c => c + ': ' + reds[c]).join('\n'));
  });
