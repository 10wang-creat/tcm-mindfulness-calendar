/**
 * 圖標批次優化腳本
 * 將所有 logo 和 icon 統一調整尺寸並壓縮
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // 源目錄
  sourceDir: path.join(__dirname, 'public', 'logo'),
  // 輸出目錄（優化後）
  outputDir: path.join(__dirname, 'public', 'logo_optimized'),
  
  // 尺寸設定
  sizes: {
    // 導航圖標 - 64x64
    icons: {
      size: 64,
      pattern: /^icon_/
    },
    // Logo - 96x96
    logos: {
      size: 96,
      pattern: /^logo_/
    }
  },
  
  // 壓縮品質
  quality: 90
};

async function optimizeImages() {
  console.log('🚀 開始優化圖標...\n');
  
  // 確保輸出目錄存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`📁 創建輸出目錄: ${CONFIG.outputDir}\n`);
  }
  
  // 取得所有 PNG 檔案
  const files = fs.readdirSync(CONFIG.sourceDir)
    .filter(file => file.endsWith('.png'));
  
  console.log(`📦 找到 ${files.length} 個圖標檔案\n`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const file of files) {
    const inputPath = path.join(CONFIG.sourceDir, file);
    const outputPath = path.join(CONFIG.outputDir, file);
    
    // 取得原始檔案大小
    const originalStats = fs.statSync(inputPath);
    totalOriginalSize += originalStats.size;
    
    // 決定目標尺寸
    let targetSize;
    if (CONFIG.sizes.icons.pattern.test(file)) {
      targetSize = CONFIG.sizes.icons.size;
    } else if (CONFIG.sizes.logos.pattern.test(file)) {
      targetSize = CONFIG.sizes.logos.size;
    } else {
      targetSize = 64; // 預設
    }
    
    try {
      // 處理圖片
      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
        })
        .png({
          quality: CONFIG.quality,
          compressionLevel: 9,
          palette: true // 使用調色板減少檔案大小
        })
        .toFile(outputPath);
      
      // 取得優化後檔案大小
      const optimizedStats = fs.statSync(outputPath);
      totalOptimizedSize += optimizedStats.size;
      
      const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
      const originalKB = (originalStats.size / 1024).toFixed(1);
      const optimizedKB = (optimizedStats.size / 1024).toFixed(1);
      
      console.log(`✅ ${file}`);
      console.log(`   ${targetSize}x${targetSize}px | ${originalKB} KB → ${optimizedKB} KB (減少 ${savings}%)`);
      
    } catch (error) {
      console.error(`❌ 處理 ${file} 時發生錯誤:`, error.message);
    }
  }
  
  // 總結
  console.log('\n' + '='.repeat(60));
  console.log('📊 優化完成！');
  console.log(`   原始總大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   優化後總大小: ${(totalOptimizedSize / 1024).toFixed(1)} KB`);
  console.log(`   總節省: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`\n📁 優化後的圖標位於: ${CONFIG.outputDir}`);
}

// 執行
optimizeImages().catch(console.error);
