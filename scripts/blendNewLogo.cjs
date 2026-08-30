const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function blendAndProcessLogo() {
  const inputPath = "C:\\Users\\ASFJK\\.gemini\\antigravity-ide\\brain\\0b0c3439-9ee6-453f-b699-8bbee2b71b88\\.user_uploaded\\media_1788120093714.jpg";
  
  console.log('Loading new uploaded logo from:', inputPath);

  // 1. Load image and get raw RGBA buffer
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Original image size: ${width}x${height}`);

  // 2. Perform breadth-first search (BFS) flood fill from the 4 corners to only remove outer background white pixels
  // This preserves any specular highlights or white elements inside the emblem!
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isWhiteOrNearWhite(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // If color is very close to white/light gray background (e.g. > 235 on all channels)
    return r >= 235 && g >= 235 && b >= 235;
  }

  // Enqueue all 4 border edges
  for (let x = 0; x < width; x++) {
    if (isWhiteOrNearWhite(x, 0)) {
      queue.push([x, 0]);
      visited[0 * width + x] = 1;
    }
    if (isWhiteOrNearWhite(x, height - 1)) {
      queue.push([x, height - 1]);
      visited[(height - 1) * width + x] = 1;
    }
  }
  for (let y = 0; y < height; y++) {
    if (isWhiteOrNearWhite(0, y) && !visited[y * width + 0]) {
      queue.push([0, y]);
      visited[y * width + 0] = 1;
    }
    if (isWhiteOrNearWhite(width - 1, y) && !visited[y * width + (width - 1)]) {
      queue.push([width - 1, y]);
      visited[y * width + (width - 1)] = 1;
    }
  }

  let head = 0;
  const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const pIdx = (cy * width + cx) * channels;

    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];
    const brightness = (r + g + b) / 3;

    if (brightness >= 248) {
      data[pIdx + 3] = 0; // Completely transparent
    } else {
      // Soft edge anti-aliasing transition
      const alpha = Math.max(0, Math.min(255, (255 - brightness) * 16));
      data[pIdx + 3] = Math.round(alpha);
    }

    for (const [dx, dy] of neighbors) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex]) {
          visited[nIndex] = 1;
          if (isWhiteOrNearWhite(nx, ny)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  // 3. Create transparent PNG
  const pngBuffer = await sharp(data, {
    raw: { width, height, channels }
  })
  .png({ quality: 100 })
  .toBuffer();

  // 4. Auto-trim any leftover outer transparent bounds for maximum tightness
  const finalBuffer = await sharp(pngBuffer)
    .trim()
    .toBuffer();

  const finalMeta = await sharp(finalBuffer).metadata();
  console.log(`Blended & tight-cropped size: ${finalMeta.width}x${finalMeta.height}`);

  // 5. Save PNG to public folders
  fs.writeFileSync(path.join(__dirname, '../public/images/logo.png'), finalBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), finalBuffer);

  // 6. Save clean flattened JPG
  const jpgBuffer = await sharp(finalBuffer)
    .flatten({ background: '#FFFFFF' })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/images/logo.jpg'), jpgBuffer);

  // 7. Update base64 for PDF documents
  const base64 = finalBuffer.toString('base64');
  const dataUri = 'data:image/png;base64,' + base64;
  const out = `// Official Al Shujaiat Foundation high-res brand logo asset for PDF receipts & Identity Cards\nexport const ASFJK_LOGO_BASE64 = '${dataUri}';\n`;
  fs.writeFileSync(path.join(__dirname, '../src/services/logoAsset.ts'), out);

  console.log('Successfully blended new logo, preserved internal highlights, and updated all assets!');
}

blendAndProcessLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
