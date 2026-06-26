import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const floralDir = path.join(process.cwd(), 'src/assets/images/Editor 1/Texture/Floral');

async function convertDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await convertDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      const outputName = entry.name.replace(/\.png$/, '.webp');
      const outputPath = path.join(dir, outputName);
      
      console.log(`Converting ${entry.name} -> ${outputName}...`);
      
      try {
        const isNormalOrHeight = entry.name.toLowerCase().includes('normal') || 
                                 entry.name.toLowerCase().includes('displacement') || 
                                 entry.name.toLowerCase().includes('height');
                                 
        const quality = isNormalOrHeight ? 85 : 80;
        
        await sharp(fullPath)
          .webp({ quality })
          .toFile(outputPath);
          
        fs.unlinkSync(fullPath);
        console.log(`Successfully converted and deleted original: ${entry.name}`);
      } catch (err) {
        console.error(`Error converting ${entry.name}:`, err);
      }
    }
  }
}

async function main() {
  console.log('Starting texture conversion to WebP...');
  await convertDirectory(floralDir);
  console.log('Finished WebP conversion!');
}

main().catch(console.error);
