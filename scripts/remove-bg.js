const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'Screenshot_2026-06-28_142352-removebg-preview.png');
const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

async function removeGrayBg() {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Image: ${width}x${height}, channels: ${channels}`);

  const pixelData = new Uint8Array(data);
  let removed = 0;

  for (let i = 0; i < pixelData.length; i += channels) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];

    // Detect light gray / near-white background pixels
    // Gray pixels have R≈G≈B and are light (> 200)
    const avg = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));

    if (avg > 195 && maxDiff < 15) {
      pixelData[i + 3] = 0; // fully transparent
      removed++;
    }
  }

  console.log(`Removed ${removed} gray/white background pixels`);

  await sharp(Buffer.from(pixelData), {
    raw: { width, height, channels },
  })
    .png()
    .toFile(outputPath);

  console.log('Done! Saved to', outputPath);
}

removeGrayBg().catch(console.error);
