// Rasterizes public/icons/icon.svg into the PNG sizes the web app manifest and
// apple-touch-icon reference. Run once after changing the master SVG:
//
//   npm run gen:icons
//
// Outputs are committed to the repo so the build/Docker image don't need sharp.
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
const svg = await readFile(join(iconsDir, 'icon.svg'))

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const t of targets) {
  // density high enough that the 512 render is crisp before downscaling.
  await sharp(svg, { density: 512 })
    .resize(t.size, t.size, { fit: 'cover' })
    .png()
    .toFile(join(iconsDir, t.name))
  console.log('generated', t.name)
}
