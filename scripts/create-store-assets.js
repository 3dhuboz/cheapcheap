/**
 * Generates Play Store required graphics (icon + feature graphic).
 * Run: node scripts/create-store-assets.js
 * Output goes to store-assets/ folder — upload these to Google Play Console.
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

function makePNG(width, height, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rowSize = width * 3;
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    const off = y * (rowSize + 1);
    raw[off] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
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

// Solid colour helper
const solid = (r, g, b) => () => [r, g, b];

// Gradient: dark green top → bright green bottom
const gradient = (x, y, w, h) => {
  const t = y / h;
  return [
    Math.round(20 + t * 45),
    Math.round(100 + t * 55),
    Math.round(40 + t * 38),
  ];
};

const OUT_DIR = path.join(__dirname, '..', 'store-assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const files = [
  // Play Store app icon — 512×512, no transparency allowed
  { name: 'play-icon-512.png',       w: 512,  h: 512,  fn: solid(45, 155, 78) },
  // Feature graphic — 1024×500
  { name: 'feature-graphic.png',     w: 1024, h: 500,  fn: gradient },
  // Phone screenshot placeholders — 9:16 (1080×1920)
  { name: 'screenshot-1.png',        w: 1080, h: 1920, fn: solid(45, 155, 78) },
  { name: 'screenshot-2.png',        w: 1080, h: 1920, fn: solid(30, 120, 60) },
];

for (const { name, w, h, fn } of files) {
  const dest = path.join(OUT_DIR, name);
  fs.writeFileSync(dest, makePNG(w, h, fn));
  console.log(`✅  store-assets/${name}  (${w}×${h})`);
}

console.log(`
Done! Files saved to store-assets/

Upload to Google Play Console:
  play-icon-512.png    → App icon (512×512)
  feature-graphic.png  → Feature graphic (1024×500)
  screenshot-*.png     → Phone screenshots (replace with real phone screenshots!)

⚠️  Replace screenshot placeholders with actual screenshots from your phone
    before submitting for review.
`);
