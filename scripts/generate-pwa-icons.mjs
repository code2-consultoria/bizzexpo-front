import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Cores do tema BizzExpo
const PRIMARY_COLOR = '#0047AB'; // Azul primário
const TEXT_COLOR = '#FFFFFF';

// Criar SVG do ícone
function createIconSVG(size) {
  const fontSize = Math.floor(size * 0.5);
  const padding = Math.floor(size * 0.1);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0066CC;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#003380;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
      <text
        x="50%"
        y="55%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="middle"
      >B</text>
    </svg>
  `;
}

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createIconSVG(size);
    const outputPath = join(publicDir, `pwa-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Gerado: pwa-${size}x${size}.png`);
  }

  // Gerar também apple-touch-icon
  const appleSvg = createIconSVG(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Gerado: apple-touch-icon.png');

  console.log('\nÍcones PWA gerados com sucesso!');
}

generateIcons().catch(console.error);
