/**
 * Image optimization script for QUIZUP
 * 
 * This script optimizes images in the public directory to improve loading performance.
 * It processes PNG, JPG and JPEG files, creating optimized versions that are smaller in size.
 * 
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Configure optimization settings
const settings = {
  png: {
    quality: 75,
    compressionLevel: 9,
  },
  jpeg: {
    quality: 80,
    progressive: true,
  }
};

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  
  // Skip already optimized files
  if (fileName.includes('.optimized')) {
    return;
  }
  
  console.log(`Optimizing: ${fileName}`);
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const outputPath = filePath.replace(ext, `.optimized${ext}`);
    
    if (ext === '.png') {
      await image
        .png(settings.png)
        .toFile(outputPath);
    } else {
      await image
        .jpeg(settings.jpeg)
        .toFile(outputPath);
    }
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`✅ Optimized ${fileName}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Optimized: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savingsPercent}%`);
    
  } catch (error) {
    console.error(`❌ Error optimizing ${fileName}:`, error.message);
  }
}

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Process subdirectories recursively
      await processDirectory(filePath);
    } else if (EXTENSIONS.includes(path.extname(filePath).toLowerCase())) {
      // Process image files
      await optimizeImage(filePath);
    }
  }
}

// Start the optimization process
(async () => {
  console.log('🖼️ Starting image optimization...');
  await processDirectory(PUBLIC_DIR);
  console.log('✨ Image optimization completed!');
})(); 