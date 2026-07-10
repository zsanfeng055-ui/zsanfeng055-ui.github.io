const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const outputDir = path.resolve(__dirname, "../public");

function fill(png, color) {
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      setPixel(png, x, y, color);
    }
  }
}

function setPixel(png, x, y, color) {
  const index = (png.width * y + x) << 2;
  png.data[index] = color[0];
  png.data[index + 1] = color[1];
  png.data[index + 2] = color[2];
  png.data[index + 3] = color[3];
}

function roundedRect(png, x, y, width, height, radius, color) {
  const right = x + width - 1;
  const bottom = y + height - 1;
  for (let py = y; py <= bottom; py += 1) {
    for (let px = x; px <= right; px += 1) {
      const cx = Math.min(Math.max(px, x + radius), right - radius);
      const cy = Math.min(Math.max(py, y + radius), bottom - radius);
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(png, px, py, color);
      }
    }
  }
}

function circle(png, cx, cy, radius, color) {
  const radiusSquared = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(png, x, y, color);
      }
    }
  }
}

function scaled(value, size) {
  return Math.round((value / 512) * size);
}

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const red = [255, 36, 66, 255];
  const softRed = [255, 139, 155, 255];
  const white = [255, 255, 255, 255];

  fill(png, red);
  roundedRect(
    png,
    scaled(132, size),
    scaled(92, size),
    scaled(248, size),
    scaled(328, size),
    scaled(44, size),
    white
  );
  circle(png, scaled(196, size), scaled(174, size), scaled(18, size), red);
  roundedRect(png, scaled(228, size), scaled(158, size), scaled(96, size), scaled(32, size), scaled(16, size), red);
  roundedRect(png, scaled(180, size), scaled(238, size), scaled(152, size), scaled(24, size), scaled(12, size), softRed);
  roundedRect(png, scaled(180, size), scaled(294, size), scaled(152, size), scaled(24, size), scaled(12, size), softRed);
  roundedRect(png, scaled(180, size), scaled(350, size), scaled(104, size), scaled(24, size), scaled(12, size), softRed);

  return PNG.sync.write(png);
}

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(outputDir, "icon-" + size + ".png"), createIcon(size));
}
