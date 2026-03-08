/**
 * Generates placeholder PNG assets required by app.json.
 * Run once: node scripts/create-assets.js
 * Replace the generated files with real designs before submitting to app stores.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rowSize = width * 3;
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    const off = y * (rowSize + 1);
    raw[off] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      raw[off + 1 + x * 3]     = r;
      raw[off + 1 + x * 3 + 1] = g;
      raw[off + 1 + x * 3 + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

const GREEN  = [45, 155, 78];   // #2D9B4E — primary brand green
const WHITE  = [255, 255, 255];
const YELLOW = [245, 200, 66];  // #F5C842 — secondary

const files = [
  { name: 'icon.png',             size: 1024, color: GREEN  },
  { name: 'adaptive-icon.png',    size: 1024, color: GREEN  },
  { name: 'splash.png',           size: 1284, color: GREEN  },
  { name: 'favicon.png',          size: 48,   color: GREEN  },
  { name: 'notification-icon.png',size: 96,   color: WHITE  },
];

for (const { name, size, color } of files) {
  const dest = path.join(ASSETS_DIR, name);
  fs.writeFileSync(dest, makePNG(size, size, ...color));
  console.log(`✅  assets/${name}  (${size}×${size})`);
}

console.log('\nDone! Replace these placeholders with real designs before submitting to the app stores.');
