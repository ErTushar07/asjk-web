import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgPath = path.join(__dirname, '../public/images/logo.png');
const outPath = path.join(__dirname, '../src/services/logoAsset.ts');

const imgBuffer = fs.readFileSync(imgPath);
const base64 = imgBuffer.toString('base64');

const content = `// Official Al Shujaiat Foundation high-res brand logo asset for PDF receipts & Identity Cards
export const ASFJK_LOGO_BASE64 = 'data:image/png;base64,${base64}';
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('Successfully generated logoAsset.ts, size:', content.length);
