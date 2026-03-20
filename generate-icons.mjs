// generate-icons.mjs - 自動產生 PWA 所需的所有圖示
// 使用方式: node generate-icons.mjs
// 確保已安裝 sharp: npm install sharp

import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const sourceImage = join(__dirname, 'public', 'logo', 'logo_main_square.png')
const outputDir = join(__dirname, 'public', 'icons')

async function generateIcons() {
  await mkdir(outputDir, { recursive: true })
  console.log(`\n📁 輸出資料夾: ${outputDir}`)
  console.log(`🖼️  來源圖片: ${sourceImage}\n`)

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`)
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 253, g: 246, b: 236, alpha: 1 }
      })
      .png()
      .toFile(outputPath)
    console.log(`  ✅ icon-${size}x${size}.png`)
  }
  console.log('\n🎉 所有圖示產生完成！')
}

generateIcons().catch(console.error)
