const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function process() {
  const sealPath = 'C:\\Users\\ASFJK\\.gemini\\antigravity-ide\\brain\\3ce6c4c0-d53f-4e33-82a7-1cd67eed4c31\\.user_uploaded\\media_1788278539307.jpg';
  const sigPath = 'C:\\Users\\ASFJK\\.gemini\\antigravity-ide\\brain\\3ce6c4c0-d53f-4e33-82a7-1cd67eed4c31\\.user_uploaded\\media_1788278553644.png';

  console.log('Reading seal...');
  const sealMeta = await sharp(sealPath).metadata();
  console.log('Seal metadata:', sealMeta);

  console.log('Reading signature...');
  const sigMeta = await sharp(sigPath).metadata();
  console.log('Signature metadata:', sigMeta);

  // 1. Process Seal: Convert paper background to transparent alpha & apply circular mask
  const { data: sealRaw, info: sealInfo } = await sharp(sealPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sealPixels = new Uint8Array(sealRaw);
  const centerX = sealInfo.width / 2;
  const centerY = sealInfo.height / 2;
  const maxRadius = Math.min(centerX, centerY) * 0.98;

  for (let y = 0; y < sealInfo.height; y++) {
    for (let x = 0; x < sealInfo.width; x++) {
      const idx = (y * sealInfo.width + x) * 4;
      const r = sealPixels[idx];
      const g = sealPixels[idx + 1];
      const b = sealPixels[idx + 2];

      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (dist > maxRadius) {
        // Outside circular stamp boundary
        sealPixels[idx + 3] = 0;
        continue;
      }

      const brightness = (r + g + b) / 3;
      const isBlueInk = (b > r + 12 || b > g + 12) && brightness < 210;
      const isDarkInk = brightness < 135;

      if (isBlueInk || isDarkInk) {
        sealPixels[idx] = 26;       // #1A365D / #1E3A8A deep navy blue
        sealPixels[idx + 1] = 54;
        sealPixels[idx + 2] = 160;
        const alpha = Math.min(255, Math.max(0, Math.round((225 - brightness) * 2.5)));
        sealPixels[idx + 3] = alpha;
      } else {
        sealPixels[idx + 3] = 0;
      }
    }
  }

  const sealOutPath = path.join(__dirname, '../public/images/seal.png');
  await sharp(sealPixels, {
    raw: {
      width: sealInfo.width,
      height: sealInfo.height,
      channels: 4
    }
  })
  .trim() // Crop to non-transparent bounding box
  .png()
  .toFile(sealOutPath);
  console.log('Seal saved to:', sealOutPath);

  // 2. Process Signature: Crop around the blue ink signature and make background transparent
  const { data: sigRaw, info: sigInfo } = await sharp(sigPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sigPixels = new Uint8Array(sigRaw);
  for (let i = 0; i < sigPixels.length; i += 4) {
    const r = sigPixels[i];
    const g = sigPixels[i + 1];
    const b = sigPixels[i + 2];

    const brightness = (r + g + b) / 3;
    // Blue ink on white paper
    const isInk = (b > r + 10 || b > g + 10 || brightness < 180) && brightness < 235;

    if (isInk) {
      // Vibrant fountain pen royal blue ink
      sealPixels[i] = 16;
      sealPixels[i + 1] = 44;
      sealPixels[i + 2] = 150;
      const alpha = Math.min(255, Math.max(0, Math.round((240 - brightness) * 2.8)));
      sigPixels[i + 3] = alpha;
      // normalize color
      sigPixels[i] = Math.min(20, r);
      sigPixels[i + 1] = Math.min(50, g);
      sigPixels[i + 2] = Math.max(160, b);
    } else {
      sigPixels[i + 3] = 0;
    }
  }

  const sigOutPath = path.join(__dirname, '../public/images/signature.png');
  await sharp(sigPixels, {
    raw: {
      width: sigInfo.width,
      height: sigInfo.height,
      channels: 4
    }
  })
  .trim() // Crop tightly to signature
  .png()
  .toFile(sigOutPath);
  console.log('Signature saved to:', sigOutPath);

  // Read base64
  const sealBase64 = 'data:image/png;base64,' + fs.readFileSync(sealOutPath).toString('base64');
  const sigBase64 = 'data:image/png;base64,' + fs.readFileSync(sigOutPath).toString('base64');

  const assetContent = `/**
 * Official Seal & Signature Base64 Assets
 * Extracted and transparency-blended for PDFs and Web UI
 */
export const ASFJK_SEAL_BASE64 = '${sealBase64}';
export const ASFJK_SIGNATURE_BASE64 = '${sigBase64}';
`;

  fs.writeFileSync(path.join(__dirname, '../src/services/stampAsset.ts'), assetContent, 'utf8');
  console.log('Generated src/services/stampAsset.ts');
}

process().catch(console.error);
