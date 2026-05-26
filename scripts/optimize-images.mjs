import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'

const INPUT_DIR = 'public/images/villa'
const MAX_WIDTH = 1400
const QUALITY = 82

const files = await readdir(INPUT_DIR)
const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f))

console.log(`Optimizing ${images.length} images...\n`)

for (const file of images) {
  const input = join(INPUT_DIR, file)
  const name = basename(file, extname(file))
  const output = join(INPUT_DIR, `${name}.webp`)

  const before = (await stat(input)).size
  await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output)
  const after = (await stat(output)).size

  const saving = Math.round((1 - after / before) * 100)
  console.log(`${file.padEnd(40)} ${(before/1024/1024).toFixed(1)}MB → ${(after/1024).toFixed(0)}KB  (-${saving}%)`)
}

console.log('\nDone.')
