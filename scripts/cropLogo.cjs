const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/images/logo.png');
  
  // First trim all surrounding white background
  const trimmedBuffer = await sharp(inputPath)
    .trim({
      background: '#FFFFFF',
      threshold: 20
    })
    .toBuffer();

  const meta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed size: ${meta.width} x ${meta.height}`);

  // Now, make white pixels (background) transparent so the circular emblem floats cleanly without any white box artifact
  const { data, info } = await sharp(trimmedBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Process raw RGBA pixels: any near-white pixel on the outer edges becomes transparent
  // Find center of the image
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check distance from center
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      // If outside circle or if it's white background, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        // Soft edge anti-aliasing
        const avg = (r + g + b) / 3;
        if (avg >= 250) {
          data[idx + 3] = 0; // fully transparent
        } else {
          // semi-transparent edge
          const opacity = Math.max(0, Math.min(255, (255 - avg) * 25.5));
          data[idx + 3] = Math.round(opacity);
        }
      }
    }
  }

  const transparentBuffer = await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .png({ quality: 100 })
  .toBuffer();

  // Trim once again to ensure zero padding
  const finalBuffer = await sharp(transparentBuffer)
    .trim()
    .toBuffer();

  const finalMeta = await sharp(finalBuffer).metadata();
  console.log(`Final tight crop size: ${finalMeta.width} x ${finalMeta.height}`);

  // Save to public images
  fs.writeFileSync(path.join(__dirname, '../public/images/logo.png'), finalBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), finalBuffer);

  // Also save a clean white-backed version for jpg
  const jpgBuffer = await sharp(finalBuffer)
    .flatten({ background: '#FFFFFF' })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/images/logo.jpg'), jpgBuffer);

  // Update base64 in logoAsset.ts for PDF generation
  const base64 = finalBuffer.toString('base64');
  const dataUri = 'data:image/png;base64,' + base64;
  const out = `// Official Al Shujaiat Foundation high-res brand logo asset for PDF receipts & Identity Cards\nexport const ASFJK_LOGO_BASE64 = '${dataUri}';\n`;
  fs.writeFileSync(path.join(__dirname, '../src/services/logoAsset.ts'), out);

  console.log('Successfully cropped, removed white borders, and updated all logo assets!');
}

processLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
